import { IsNotEmpty } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { I18nTranslations } from '../../.generate/i18n.generated';
import { ApiProperty } from '@nestjs/swagger';

export class CreateI18Dto {
  @ApiProperty({description: '语言主键'})
  @IsNotEmpty({
    message: i18nValidationMessage<I18nTranslations>('validation.NOT_EMPTY'),
  })
  lang: number;
  @ApiProperty({description: '国际化词条key'})
  @IsNotEmpty({
    message: i18nValidationMessage<I18nTranslations>('validation.NOT_EMPTY'),
  })
  key: string;
  @ApiProperty({description: '国际化词条内容'})
  @IsNotEmpty({
    message: i18nValidationMessage<I18nTranslations>('validation.NOT_EMPTY'),
  })
  content: string;
}
