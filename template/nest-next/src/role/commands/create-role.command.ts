import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateRoleDto } from '../dto/create-role.dto';
import { Role, RoleId, RoleMenu, RolePermission } from '../role.entity';
import { EntityRepository } from '@mikro-orm/mysql';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager } from '@mikro-orm/core';
import { RedisService } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';
import { roleTotal } from '@app/shared';
import { RoleExistsError } from '../errors';

export class CreateRoleRequest extends CreateRoleDto {}

export class CreateRole extends Command<RoleId> {
  constructor(public readonly data: CreateRoleRequest) {
    super();
  }
}

@CommandHandler(CreateRole)
export class CreateRoleHandler implements ICommandHandler<CreateRole> {
  private redis: Redis;
  constructor(
    private readonly em: EntityManager,
    @InjectRepository(Role)
    private readonly role: EntityRepository<Role>,
    @InjectRepository(RolePermission)
    private readonly permission: EntityRepository<RolePermission>,
    @InjectRepository(RoleMenu)
    private readonly menu: EntityRepository<RoleMenu>,
    private readonly redisService: RedisService,
  ) {
    this.redis = this.redisService.getOrThrow();
  }
  async execute({ data }: CreateRole): Promise<RoleId> {
    const { name, permissionIds = [], menuIds = [] } = data;
    const exists = await this.role.findOne({ name });
    if (exists) {
      throw new RoleExistsError(name);
    }
    const role = this.role.create({ name });
    const rolePermission = permissionIds.map((id) => {
      return this.permission.create({ roleId: role.id, permissionId: id });
    });
    const roleMenu = menuIds.map((id) => {
      return this.menu.create({ roleId: role.id, menuId: id });
    });
    return this.em.transactional(async (em) => {
      em.persist(role);
      rolePermission.forEach((p) => em.persist(p));
      roleMenu.forEach((m) => em.persist(m));
      await em.flush();
      await this.redis.incr(roleTotal());
      return role.id;
    });
  }
}
