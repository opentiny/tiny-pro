import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { RoleId, RolePermission } from '../role.entity';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/core';
import type { PermissionId } from '../../permission';

export class FindRolePermissionId extends Query<Map<RoleId, PermissionId[]>> {
  constructor(public readonly roleId: RoleId[]) {
    super();
  }
}

@QueryHandler(FindRolePermissionId)
export class FindRolePermissionIdHandler implements IQueryHandler<FindRolePermissionId> {
  constructor(
    @InjectRepository(RolePermission)
    private readonly rolePermissionRepo: EntityRepository<RolePermission>,
  ) {}
  async execute(
    query: FindRolePermissionId,
  ): Promise<Map<RoleId, PermissionId[]>> {
    const rolePremissions = await Promise.all(
      query.roleId.map((id) => this.rolePermissionRepo.find({ roleId: id })),
    );
    const rolePermissionMap = new Map<RoleId, PermissionId[]>();
    for (const item of rolePremissions) {
      for (const { permissionId, roleId } of item) {
        if (!rolePermissionMap.has(roleId)) {
          rolePermissionMap.set(roleId, [permissionId]);
        } else {
          rolePermissionMap.get(roleId)!.push(permissionId);
        }
      }
    }
    return rolePermissionMap;
  }
}
