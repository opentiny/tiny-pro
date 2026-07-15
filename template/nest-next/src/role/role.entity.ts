import { Opt } from '@mikro-orm/core';
import { Entity, PrimaryKey, Property } from '@mikro-orm/decorators/legacy';
import { type MenuId } from '../menu';
import type { PermissionId } from 'src/permission';
import { v7 } from 'uuid';

export type RoleId = string & { readonly __brand: unique symbol };

export const createRoleId = (): RoleId => v7() as RoleId;

@Entity({ tableName: 'role' })
export class Role {
  @PrimaryKey({ type: 'uuid' })
  id: RoleId & Opt = createRoleId();
  @Property({ type: 'text' })
  name: string;
}

@Entity({ tableName: 'role_permission' })
export class RolePermission {
  @PrimaryKey({ type: 'uuid' })
  id: string = v7();
  @Property({ type: 'uuid', index: true })
  roleId: RoleId;
  @Property({ type: 'uuid', index: true })
  permissionId: PermissionId;
}

@Entity({ tableName: 'role_menu' })
export class RoleMenu {
  @PrimaryKey({ type: 'uuid' })
  id: string = v7();
  @Property({ type: 'uuid', index: true })
  roleId: RoleId;
  @Property({ type: 'uuid', index: true })
  menuId: MenuId;
}
