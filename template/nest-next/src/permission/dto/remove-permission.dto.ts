import { I18nTranslations } from '@app/shared';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import type { PermissionId } from '../permission.entry';

export class RemovePermissionRequest {
  @ApiProperty()
  @IsNotEmpty({
    message: i18nValidationMessage<I18nTranslations>('validation.NOT_EMPTY'),
  })
  @IsString({
    message: i18nValidationMessage<I18nTranslations>('validation.TYPE_ERROR', {
      type: 'string',
      property: 'id',
    }),
  })
  id: PermissionId;
}

export class RemovePermissionResponse {
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
