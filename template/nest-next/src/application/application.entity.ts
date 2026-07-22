import { type Opt } from '@mikro-orm/core';
import { Entity, PrimaryKey, Property } from '@mikro-orm/decorators/legacy';
import { v7 } from 'uuid';

export enum TagEnum {
  DEFAULT = '',
  SUCCESS = 'success',
  INFO = 'info',
  DANGER = 'danger',
  WARNING = 'warning',
}

export type ApplicationId = string & { readonly __brand: unique symbol };
export const createApplicationId = () => v7() as ApplicationId;
export const toApplicationId = (val: string) => val as ApplicationId;

@Entity({ tableName: 'application' })
export class Application {
  @PrimaryKey({ type: 'uuid' })
  id: Opt<ApplicationId> = createApplicationId();
  @Property({ type: 'text' })
  name: string;
  @Property({ type: 'text' })
  description: string;
  @Property({ type: 'text' })
  icon: string;
  @Property({ type: 'text' })
  tag: string;
  @Property({ type: 'text' })
  classify: string;
}
