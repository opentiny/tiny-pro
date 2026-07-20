import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { UserId, UserRole } from '../../user';
import { InjectRepository } from '@mikro-orm/nestjs';
import { RolePermission, toRoleId } from '../../role';
import { EntityRepository } from '@mikro-orm/core';
import { Permission } from '../permission.entry';

export class UserHasPermissionQuery extends Query<boolean> {
  constructor(
    public readonly permissionName: string[],
    public readonly uid: UserId,
  ) {
    super();
  }
}

@QueryHandler(UserHasPermissionQuery)
export class UserHasPermissionService implements IQueryHandler<UserHasPermissionQuery> {
  constructor(
    @InjectRepository(UserRole)
    private readonly userRoleRepository: EntityRepository<UserRole>,
    @InjectRepository(RolePermission)
    private readonly rolePermissionRepository: EntityRepository<RolePermission>,
    @InjectRepository(Permission)
    private readonly permissionRepository: EntityRepository<Permission>,
  ) {}
  async execute({
    permissionName,
    uid,
  }: UserHasPermissionQuery): Promise<boolean> {
    const roles = await this.userRoleRepository.find({
      user: uid,
    });
    if (!roles.length) {
      return false;
    }
    const permissionId = await this.permissionRepository.findOne({
      name: permissionName,
    });
    if (!permissionId) {
      return false;
    }
    const rolePermissions = await this.rolePermissionRepository.find(
      {
        roleId: { $in: roles.map((item) => toRoleId(item.roleId)) },
      },
      { logging: { enabled: true, debugMode: ['query'] } },
    );
    const rolePermissionIds = rolePermissions.map((item) => item.permissionId);
    const permissions = await this.permissionRepository.find({
      id: { $in: rolePermissionIds },
    });
    if (!permissions.length) {
      return false;
    }
    if (permissions.find((perm) => perm.name === '*')) {
      return true;
    }
    return permissionName.every(
      (name) => permissions.find((perm) => perm.name === name) !== undefined,
    );
  }
}
