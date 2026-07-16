import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { RoleInfo, UserInfo } from '../dto/get-user-info.dto';
import { User, UserRole } from '../user.entity';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/core';
import { UserNotFound } from '../error';
import { Role, RoleMenu, RolePermission } from '../../role';
import { Permission } from '../../permission';
import { Menu } from '../../menu';

export class GetUserInfo extends Query<UserInfo> {
  constructor(public readonly email: string) {
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
  ) {}
  async execute(query: GetUserInfo): Promise<UserInfo> {
    const user = await this.userRepository.findOne(
      {
        email: query.email,
      },
      {
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
      },
    );
    if (!user) {
      throw new UserNotFound();
    }
    const roles = await this.userRoleRepository.find({
      user: {
        id: user.id,
      },
    });
    const roleIds = roles.map((role) => role.roleId);
    const roleInfos: RoleInfo[] = [];
    for (const id of roleIds) {
      const role = await this.roleRepo.findOne({
        id,
      });
      if (!role) {
        continue;
      }
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
    return new UserInfo({
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
    });
  }
}
