import { IsNotEmpty } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { I18nTranslations } from '../../.generate/i18n.generated';

export class LogoutAuthDto {
  @IsNotEmpty({
    message: i18nValidationMessage<I18nTranslations>(
      'validation.NOT_EMPTY_HUMAN',
      {
        name: 'Token',
      }
    ),
  })
  token: string;
}
