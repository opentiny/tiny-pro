import { IsNotEmpty } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { I18nTranslations } from '../../.generate/i18n.generated';
import { ApiProperty } from '@nestjs/swagger';

export class LogoutAuthDto {
  @ApiProperty({
    description: '有效的访问令牌'
  })
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
