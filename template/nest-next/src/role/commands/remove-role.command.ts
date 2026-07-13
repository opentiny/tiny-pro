import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Role, RoleId, RoleMenu, RolePermission } from '../role.entity';
import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { RoleNotFound } from '../errors';
import { RedisService } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';
import { roleTotal } from '@app/shared';

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
    private readonly redisService: RedisService
  ) {
    this.redis = this.redisService.getOrThrow();
  }
  async execute(command: RemoveRoleCommand): Promise<RoleId> {
    const role = await this.role.findOne({ id: command.id });
    if (!role) {
      throw new RoleNotFound();
    }
    // TODO: 查找是否有用户使用该角色，如果有则不能删除
    await this.em.transactional(async (em) => {
      await em.nativeDelete(Role, { id: command.id });
      await em.nativeDelete(RolePermission, { roleId: command.id });
      await em.nativeDelete(RoleMenu, { roleId: command.id });
      await this.redis.decr(roleTotal());
    });
    return command.id;
  }
}
