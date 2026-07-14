import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { Role, RoleId, RoleMenu, RolePermission } from '../role.entity';
import { RoleInfo } from '../dto/role-info';
import { EntityRepository } from '@mikro-orm/mysql';
import { InjectRepository } from '@mikro-orm/nestjs';
import type { PermissionId } from '../../permission';

export type FindRoleResponse = {
  role: Role | null;
  permission: PermissionId[];
  menu: number[];
};

export class FindRole extends Query<FindRoleResponse> {
  constructor(public id: RoleId) {
    super();
  }
}

@QueryHandler(FindRole)
export class FindRoleHandler implements IQueryHandler<RoleInfo> {
  constructor(
    @InjectRepository(Role)
    private readonly repo: EntityRepository<Role>,
    @InjectRepository(RolePermission)
    private readonly rolePermissionRepo: EntityRepository<RolePermission>,
    @InjectRepository(RoleMenu)
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
