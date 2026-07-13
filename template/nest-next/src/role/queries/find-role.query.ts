import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { Role, RoleId, RoleMenu, RolePermission } from '../role.entity';
import { RoleInfo } from '../dto/role-info';
import { EntityRepository } from '@mikro-orm/mysql';

export type FindRoleResponse = {
  role: Role | null;
  permission: number[];
  menu: number[];
};

export class FindRole extends Query<FindRoleResponse> {
  constructor(public id: RoleId) {
    super();
  }
}

@QueryHandler(FindRole)
export class FindRoleQuery implements IQueryHandler<RoleInfo> {
  constructor(
    private readonly repo: EntityRepository<Role>,
    private readonly rolePermissionRepo: EntityRepository<RolePermission>,
    private readonly roleMenuRepo: EntityRepository<RoleMenu>,
  ) {}
  async execute(query: RoleInfo): Promise<FindRoleResponse> {
    const [role, menus, permissions] = await Promise.all([
      this.repo.findOne({ id: query.id }),
      this.roleMenuRepo.find({ roleId: query.id }),
      this.rolePermissionRepo.find({ roleId: query.id }),
    ]);
    return {
      role: role,
      permission: permissions.map((item) => item.permissionId),
      menu: menus.map((item) => item.menuId),
    };
  }
}
