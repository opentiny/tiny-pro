import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { RoleInfo, UserInfo } from '../dto/get-user-info.dto';
import { User, UserId, UserRole } from '../user.entity';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository, FilterOptions, FilterQuery } from '@mikro-orm/core';
import { UserNotFound } from '../error';
import { Role, RoleMenu, RolePermission } from '../../role';
import { Permission } from '../../permission';
import { Menu } from '../../menu';

export type GetUserInfoRequest = {
  email: string[];
  id?: never;
} | {
  email?: never;
  id: UserId[]
}

export class GetUserInfo extends Query<UserInfo[]> {
  constructor(
    public readonly request: GetUserInfoRequest
  ) {
    super();
  }
}

@QueryHandler(GetUserInfo)
export class GetUserInfoService implements IQueryHandler<GetUserInfo> {
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
  ) { }
  async execute(query: GetUserInfo): Promise<UserInfo[]> {
    const whereCondition: FilterQuery<User> = {};
    if (query.request.email) {
      whereCondition['email'] = { $in: query.request.email };
    }
    if (query.request.id) {
      whereCondition['id'] = { $in: query.request.id };
    }
    const users = await this.userRepository.findAll(
      {
        where:whereCondition,
        fields: [
          'id',
          'name',
          'email',
          'department',
          'employeeType',
          'protocolStart',
          'protocolEnd',
          'probationEnd',
          'probationStart',
          'probationDuration',
          'address',
          'status',
        ],
        populate: ['role']
      },
    );
    if (!users.length) {
      throw new UserNotFound();
    }
    const roleMap = new Map(
      users.map((user) => {
        return [user.id, user.role.map((role) => role.roleId)];
      })
    );
    const userInfos: UserInfo[] = [];
    for (const user of users) {
      const roleIds = roleMap.get(user.id) ?? [];
      const roles = await this.roleRepo.findAll({
        where: {
          id: { $in: roleIds }
        }
      });
      const roleInfos: RoleInfo[] = [];
      for (const role of roles) {
        const id = role.id;
        const rolePermissions = await this.rolePermissionRepo.find({
          roleId: id,
        });
        const roleMenus = await this.roleMenuRepo.find({
          roleId: id,
        });
        const permissions = await this.permissionRepo.find({
          id: {
            $in: rolePermissions.map((permission) => permission.permissionId),
          },
        });
        const menus = await this.menuRepo.find({
          id: {
            $in: roleMenus.map((menu) => menu.menuId),
          },
        });
        const roleInfo = new RoleInfo(role.id, role.name, permissions, menus);
        roleInfos.push(roleInfo);
      }
      userInfos.push(
        new UserInfo({
          id: user.id,
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
        })
      )
    }
    return userInfos;
  }
}
