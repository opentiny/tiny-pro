import { Collection, type Opt } from '@mikro-orm/core';
import {
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Property,
} from '@mikro-orm/decorators/legacy';
import { v7 } from 'uuid';

export type LangId = string & { readonly __brand: unique symbol };
export type I18nRecordId = string & { readonly __brand: unique symbol };

export const toLangId = (id: string) => id as LangId;
export const toI18nRecordId = (id: string) => id as I18nRecordId;

export const createLangId = () => v7() as LangId;
export const createI18nRecordId = () => v7() as I18nRecordId;

@Entity()
export class Lang {
  @PrimaryKey({ type: 'uuid' })
  id: Opt<LangId> = createLangId();
  @Property({ type: 'text' })
  name: string;
  @OneToMany(() => I18n, (i18n) => i18n.lang)
  i18n: Collection<I18n> = new Collection<I18n>(this);
}

@Entity({ tableName: 'i18' })
export class I18n {
  @PrimaryKey({ type: 'uuid' })
  id: Opt<I18nRecordId> = createI18nRecordId();
  @Property({ type: 'text' })
  key: string;
  @Property({ columnType: 'longtext', type: 'longtext' })
  content: string;
  @ManyToOne(() => Lang)
  lang: Lang;
}
