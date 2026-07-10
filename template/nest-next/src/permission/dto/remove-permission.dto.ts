import { I18nTranslations } from '@app/shared';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class RemovePermissionRequest {
  @ApiProperty()
  @IsNotEmpty({
    message: i18nValidationMessage<I18nTranslations>('validation.NOT_EMPTY'),
  })
  @IsNumber(
    {},
    {
      message: i18nValidationMessage<I18nTranslations>(
        'validation.TYPE_ERROR',
        {
          type: 'number',
          property: 'id',
        },
      ),
    },
  )
  id: number;
}

export class RemovePermissionResponse {
  @ApiProperty()
  id: number;
  @ApiProperty()
  desc: string;
  @ApiProperty()
  name: string;

  constructor(id: number, desc: string, name: string) {
    this.id = id;
    this.desc = desc;
    this.name = name;
  }
}
