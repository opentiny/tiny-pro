import { CreatePermissionDto } from './create-permission.dto';
import { IsNotEmpty } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { I18nTranslations } from '../../.generate/i18n.generated';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import type { PermissionId } from '../permission.entry';

export class UpdatePermissionDto extends PartialType(CreatePermissionDto) {
  @ApiProperty({
    description: '你想要修改的权限字段的数据库主键',
  })
  @IsNotEmpty({
    message: i18nValidationMessage<I18nTranslations>('validation.NOT_EMPTY'),
  })
  id: PermissionId;
}

export class UpdatePermissionResponse {
  @ApiProperty()
  id: PermissionId;

  constructor(id: PermissionId) {
    this.id = id;
  }
}
