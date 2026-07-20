import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  FindAllRole,
  FindRole,
  FindRoleMenuId,
  FindRolePermissionId,
  GetRoleTotal,
} from './queries';
import { FindPermission } from '../permission';
import { FindMenu } from 'src/menu';
import { assembleGetDetail } from './assembler/get-all-detail';
import { RoleNotFound } from './errors';
import { RoleId } from './role.entity';
import { assembleFindRole } from './assembler/find-role';
import { CreateRoleDto } from './dto/create-role.dto';
import { CreateRole } from './commands/create-role.command';
import { UpdateRoleDto } from './dto/update-role.dto';
import { UpdateRoleCommand } from './commands/update-role.command';
import { RemoveRoleCommand } from './commands/remove-role.command';
import { findAllRole } from './assembler/find-all-role';

@Injectable()
export class RoleService {
  constructor(
    private readonly qb: QueryBus,
    private readonly cb: CommandBus,
  ) {}

  async remove(id: RoleId) {
    const roleId = await this.cb.execute(new RemoveRoleCommand(id));
    return this.findRole(roleId);
  }

  async updateRole(dto: UpdateRoleDto) {
    const { id, name, permissionIds, menuIds } = dto;
    const roleId = await this.cb.execute(
      new UpdateRoleCommand(id, name, permissionIds, menuIds),
    );
    return this.findRole(roleId);
  }
  async createRole(dto: CreateRoleDto) {
    const roleId = await this.cb.execute(new CreateRole(dto));
    return this.findRole(roleId);
  }
  async findRole(id: RoleId) {
    const {
      role,
      permission: permissionIds,
      menu: menuIds,
    } = await this.qb.execute(new FindRole(id));
    if (!role) {
      throw new RoleNotFound();
    }
    const [permission, menu] = await Promise.all([
      this.qb.execute(new FindPermission(permissionIds)),
      this.qb.execute(new FindMenu(menuIds)),
    ]);
    return assembleFindRole(role, permission, menu);
  }
  async findAll() {
    const roles = await this.qb.execute(new FindAllRole());
    const roleIds = roles.map((role) => role.id);
    const [permissionIdMap, menuIdMap] = await Promise.all([
      this.qb.execute(new FindRolePermissionId(roleIds)),
      this.qb.execute(new FindRoleMenuId(roleIds)),
    ]);
    const allPermIds = [...permissionIdMap.values()].flat();
    const allMenuIds = [...menuIdMap.values()].flat();
    const [permissions, menus] = await Promise.all([
      this.qb.execute(new FindPermission(allPermIds)),
      this.qb.execute(new FindMenu(allMenuIds)),
    ]);
    const permMap = new Map(permissions.map((p) => [p.id, p]));
    const menuMap = new Map(menus.map((m) => [m.id, m]));
    return findAllRole(roles, permissionIdMap, menuIdMap, permMap, menuMap);
  }
  async findAllDetail(page?: number, limit?: number, name?: string) {
    const roles = await this.qb.execute(new FindAllRole(page, limit, name));
    const roleIds = roles.map((role) => role.id);
    const [permissionIdMap, menuIdMap, total] = await Promise.all([
      this.qb.execute(new FindRolePermissionId(roleIds)),
      this.qb.execute(new FindRoleMenuId(roleIds)),
      this.qb.execute(new GetRoleTotal()),
    ]);
    const allPermIds = [...permissionIdMap.values()].flat();
    const allMenuIds = [...menuIdMap.values()].flat();
    const [permissions, menus] = await Promise.all([
      this.qb.execute(new FindPermission(allPermIds)),
      this.qb.execute(new FindMenu(allMenuIds)),
    ]);
    const permMap = new Map(permissions.map((p) => [p.id, p]));
    const menuMap = new Map(menus.map((m) => [m.id, m]));

    const roleDetail = assembleGetDetail(
      roles,
      permissionIdMap,
      menuIdMap,
      permMap,
      menuMap,
      total,
      page,
      limit,
    );
    return roleDetail;
  }
}
