import { PartialType } from '@nestjs/mapped-types';
import { CreateMenuDto } from './create-menu.dto';
import { IsNotEmpty } from 'class-validator';
import { I18nTranslations } from '../../.generate/i18n.generated';
import { i18nValidationMessage } from 'nestjs-i18n';

export class UpdateMenuDto extends PartialType(CreateMenuDto) {
  @IsNotEmpty({
    message: i18nValidationMessage<I18nTranslations>('validation.NOT_EMPTY'),
  })
  id: number;
}
