import { Opt } from '@mikro-orm/core';
import { Entity, PrimaryKey, Property } from '@mikro-orm/decorators/legacy';
import { v7 } from 'uuid';

export type MenuId = string & { readonly __brand: unique symbol };
export const toMenuId = (id: string) => id as MenuId;
export const createMenuId = () => v7() as MenuId;

@Entity({ tableName: 'menu' })
export class Menu {
  @PrimaryKey({ type: 'uuid' })
  id: MenuId & Opt = createMenuId();
  @Property({ type: 'text' })
  name: string;
  @Property({ type: 'int' })
  order: number;
  /**
   * @deprecated
   */
  @Property({ type: 'text' })
  menuType: string;
  @Property({ nullable: true, type: 'uuid', index: true })
  parentId: null | (MenuId & Opt) = null;
  @Property({ type: 'text', nullable: true })
  icon: string | null = null;
  @Property({ type: 'text' })
  component: string;
  @Property({ type: 'text' })
  path: string;
  @Property({ type: 'text' })
  locale: string;
}
