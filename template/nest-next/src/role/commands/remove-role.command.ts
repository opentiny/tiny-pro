import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Role, RoleId, RoleMenu, RolePermission } from '../role.entity';
import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { RoleHasUserError, RoleNotFound } from '../errors';
import { RedisService } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';
import { roleTotal } from '@app/shared';
import { UserRole } from '../../user';

export class RemoveRoleCommand extends Command<RoleId> {
  constructor(public readonly id: RoleId) {
    super();
  }
}

@CommandHandler(RemoveRoleCommand)
export class RemoveRoleHandler implements ICommandHandler<RemoveRoleCommand> {
  private redis: Redis;
  constructor(
    private readonly em: EntityManager,
    @InjectRepository(Role)
    private readonly role: EntityRepository<Role>,
    @InjectRepository(UserRole)
    private readonly userRoleRepo: EntityRepository<UserRole>,
    private readonly redisService: RedisService,
  ) {
    this.redis = this.redisService.getOrThrow();
  }
  async execute(command: RemoveRoleCommand): Promise<RoleId> {
    const role = await this.role.findOne({ id: command.id });
    if (!role) {
      throw new RoleNotFound();
    }
    const user = await this.userRoleRepo.findOne({
      roleId: command.id,
    });
    if (user) {
      throw new RoleHasUserError();
    }
    await this.em.transactional(async (em) => {
      await em.nativeDelete(Role, { id: command.id });
      await em.nativeDelete(RolePermission, { roleId: command.id });
      await em.nativeDelete(RoleMenu, { roleId: command.id });
      await this.redis.decr(roleTotal());
    });
    return command.id;
  }
}
