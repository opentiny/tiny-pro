import { IsNotEmpty, ValidateIf } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { I18nTranslations } from '../../.generate/i18n.generated';
import { ApiProperty } from '@nestjs/swagger';
import type { PermissionId } from '../permission.entry';

export class CreatePermissionDto {
  @ApiProperty({
    description: '权限在使用时候的键值对.',
  })
  @IsNotEmpty({
    message: i18nValidationMessage<I18nTranslations>('validation.NOT_EMPTY'),
  })
  name: string;

  @ApiProperty({
    description: '权限在后台, 人类可读的短简介',
  })
  @IsNotEmpty({
    message: i18nValidationMessage<I18nTranslations>('validation.NOT_EMPTY'),
  })
  desc: string;
}

export class CreatePermissionResponse {
  @ApiProperty()
  id: PermissionId;
  @ApiProperty()
  desc: string;
  @ApiProperty()
  name: string;

  constructor(id: PermissionId, desc: string, name: string) {
    this.id = id;
    this.desc = desc;
    this.name = name;
  }
}
