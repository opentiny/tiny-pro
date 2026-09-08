import { Opt } from '@mikro-orm/core';
import { Entity, PrimaryKey, Property } from '@mikro-orm/decorators/legacy';
import { v7 } from 'uuid';

export const createPermissionId = (): PermissionId => v7() as PermissionId;
export const toPermissionId = (value: string) => value as PermissionId;
export type PermissionId = string & { readonly __brand: unique symbol };

@Entity({ tableName: 'permission' })
export class Permission {
  @PrimaryKey({ type: 'uuid' })
  id: PermissionId & Opt = createPermissionId();
  @Property({ type: 'text' })
  desc: string;
  @Property({ type: 'text' })
  name: string;
}
