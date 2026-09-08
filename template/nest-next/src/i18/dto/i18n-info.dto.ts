import { ApiProperty } from '@nestjs/swagger';
import { Lang } from './lang-info.dto';
import type { I18nRecordId } from '../i18.entites';

export class I18 {
  @ApiProperty({
    description: '国际化词条主键',
  })
  id: I18nRecordId;

  @ApiProperty({
    description: '国际化词条对应的语言',
    type: () => Lang,
  })
  lang: Lang;

  @ApiProperty({
    description: '国际化词条key',
  })
  key: string;

  @ApiProperty({
    description: '国际化词条内容',
  })
  content: string;

  constructor(id: I18nRecordId, lang: Lang, key: string, content: string) {
    this.id = id;
    this.lang = lang;
    this.key = key;
    this.content = content;
  }
}
