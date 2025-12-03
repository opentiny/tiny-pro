import { IsNotEmpty } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { I18nTranslations } from '../../.generate/i18n.generated';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLang {
  @ApiProperty({
    description: '语言Key'
  })
  @IsNotEmpty({
    message: i18nValidationMessage<I18nTranslations>('validation.NOT_EMPTY'),
  })
  name: string;
}
