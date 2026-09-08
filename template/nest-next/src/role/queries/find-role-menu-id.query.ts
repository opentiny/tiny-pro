import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { RoleId, RoleMenu } from '../role.entity';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/core';
import { MenuId } from '../../menu';

export class FindRoleMenuId extends Query<Map<RoleId, MenuId[]>> {
  constructor(public readonly roleId: RoleId[]) {
    super();
  }
}

@QueryHandler(FindRoleMenuId)
export class FindRoleMenuIdHandler implements IQueryHandler<FindRoleMenuId> {
  constructor(
    @InjectRepository(RoleMenu)
    private readonly roleMenuRepo: EntityRepository<RoleMenu>,
  ) {}
  async execute(query: FindRoleMenuId): Promise<Map<RoleId, MenuId[]>> {
    const roleMenus = await Promise.all(
      query.roleId.map((id) => this.roleMenuRepo.find({ roleId: id })),
    );
    const roleMenuMap = new Map<RoleId, MenuId[]>();
    for (const item of roleMenus) {
      for (const { menuId, roleId } of item) {
        if (!roleMenuMap.has(roleId)) {
          roleMenuMap.set(roleId, [menuId]);
        } else {
          roleMenuMap.get(roleId)!.push(menuId);
        }
      }
    }
    return roleMenuMap;
  }
}
