import { ApiProperty } from '@nestjs/swagger';
import { Lang } from './lang-info.dto';
import { PaginationMeta } from '@app/shared';
import type { I18nRecordId } from '../i18.entites';

export class FindAllI18nItem {
  @ApiProperty({
    description: '国际化字段的自增id',
  })
  id: I18nRecordId;
  @ApiProperty({
    description: '国际化字段对应的语言信息',
    type: () => Lang,
  })
  lang: Lang;
  @ApiProperty({
    description: '国际化字段的键',
  })
  key: string;
  @ApiProperty({
    description: '国际化字段的实际内容',
  })
  content: string;

  constructor(id: I18nRecordId, lang: Lang, key: string, content: string) {
    this.id = id;
    this.lang = lang;
    this.key = key;
    this.content = content;
  }
}

export class FindAllI18n {
  @ApiProperty({
    type: [FindAllI18nItem],
  })
  items: FindAllI18nItem[];
  @ApiProperty({
    type: PaginationMeta,
  })
  meta: PaginationMeta;
  constructor(items: FindAllI18nItem[], meta: PaginationMeta) {
    this.items = items;
    this.meta = meta;
  }
}
