import { Entity, PrimaryKey, Property } from '@mikro-orm/decorators/legacy';

@Entity({ tableName: 'permission' })
export class Permission {
  @PrimaryKey({ type: 'int', autoincrement: true })
  id: number;
  @Property({ type: 'text' })
  desc: string;
  @Property({ type: 'text' })
  name: string;

  constructor(id: number, desc: string, name: string) {
    this.id = id;
    this.desc = desc;
    this.name = name;
  }
}
