import { ApiProperty } from '@nestjs/swagger';
import type { LangId } from '../i18.entites';

export class Lang {
  @ApiProperty({
    description: '语言ID',
  })
  id: LangId;
  @ApiProperty({
    description: '语言名称',
  })
  name: string;

  constructor(id: LangId, name: string) {
    this.id = id;
    this.name = name;
  }
}
