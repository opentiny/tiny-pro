import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { GetAllUserRequest, UserList } from '../dto/get-all-user.dto';
import { InjectRepository } from '@mikro-orm/nestjs';
import { User, UserRole } from '../user.entity';
import { EntityRepository, FilterQuery } from '@mikro-orm/core';
import { RedisService } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';
import { md5, PaginationMeta, userTotal } from '@app/shared';
import { Menu } from '../../menu';
import { Permission } from '../../permission';
import { Role, RolePermission, RoleMenu } from '../../role';
import { RoleInfo, UserInfo } from '../dto/get-user-info.dto';

export class GetAllUserQuery extends Query<UserList> {
  constructor(public readonly dto: GetAllUserRequest) {
    super();
  }
}

@QueryHandler(GetAllUserQuery)
export class GetAllUserQueryHandler implements IQueryHandler<GetAllUserQuery> {
  private redis: Redis;
  constructor(
    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: EntityRepository<UserRole>,
    @InjectRepository(Role)
    private readonly roleRepo: EntityRepository<Role>,
    @InjectRepository(RolePermission)
    private readonly rolePermissionRepo: EntityRepository<RolePermission>,
    @InjectRepository(RoleMenu)
    private readonly roleMenuRepo: EntityRepository<RoleMenu>,
    @InjectRepository(Permission)
    private readonly permissionRepo: EntityRepository<Permission>,
    @InjectRepository(Menu)
    private readonly menuRepo: EntityRepository<Menu>,
    redisService: RedisService,
  ) {
    this.redis = redisService.getOrThrow();
  }
  async execute({
    dto: { name, role, email, page = 1, limit = 10 },
  }: GetAllUserQuery): Promise<UserList> {
    const whereCondition: FilterQuery<User> = {};
    const conditions: string[] = [];
    if (name) {
      whereCondition.name = { $like: name };
      conditions.push(name);
    }
    if (role?.length) {
      whereCondition.role = { $in: role };
      role.forEach((val) => conditions.push(val));
    }
    if (email) {
      whereCondition.email = { $like: email };
      conditions.push(email);
    }
    const users = await this.userRepository.find(whereCondition, {
      limit,
      offset: (page - 1) * limit,
      populate: ['role'],
    });

    const infos: UserInfo[] = [];

    for (const user of users) {
      const uid = user.id;

      const roles = await this.roleRepo.find({
        id: {
          $in: user.getRoleIds(),
        },
      });
      const roleInfos: RoleInfo[] = [];
      for (const role of roles) {
        const permissionsIds = await this.rolePermissionRepo.find({
          roleId: role.id,
        });
        const permissions = await this.permissionRepo.find({
          id: {
            $in: permissionsIds.map((resp) => resp.permissionId),
          },
        });
        const menusIds = await this.roleMenuRepo.find({
          roleId: role.id,
        });
        const menus = await this.menuRepo.find({
          id: {
            $in: menusIds.map((resp) => resp.menuId),
          },
        });
        const roleInfo = new RoleInfo(role.id, role.name, permissions, menus);
        roleInfos.push(roleInfo);
      }
      const info = new UserInfo({
        id: uid,
        name: user.name,
        email: user.email,
        department: user.department,
        employeeType: user.employeeType,
        protocolStart: user.protocolStart,
        protocolEnd: user.protocolEnd,
        probationEnd: user.probationEnd,
        probationStart: user.probationStart,
        probationDuration: user.probationDuration,
        address: user.address,
        status: user.status,
        role: roleInfos,
      });
      infos.push(info);
    }
    if (conditions.length) {
      const cnt = await this.userRepository.count({ ...whereCondition });
      await this.redis.set(userTotal(md5(conditions)), cnt);
    }
    const total = await this.redis
      .get(userTotal(conditions.length ? md5(conditions) : undefined))
      .then((value) => (!value ? 0 : Number.parseInt(value)));
    const meta = new PaginationMeta(limit, total, limit, page);
    return new UserList(infos, meta);
  }
}
