import { Entity, PrimaryKey, Property } from "@mikro-orm/decorators/legacy";

@Entity({ tableName: 'menu' })
export class Menu {
  @PrimaryKey({ type: 'int', autoincrement: true })
  id: number;
  @Property({ type: 'text' })
  name: string;
  @Property({ type: 'int' })
  order: number;
  /**
   * @deprecated
  */
  @Property({ type: 'text' })
  menuType: string;
  @Property({ nullable: true, type: 'int', index: true })
  parentId: number | null;
  @Property({ type: 'text', nullable: true })
  icon: string | null;
  @Property({ type: 'text' })
  component: string;
  @Property({ type: 'text' })
  path: string;
  @Property({ type: 'text' })
  locale: string;
}
