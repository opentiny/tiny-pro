import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsNotEmpty } from 'class-validator';
import { I18nTranslations } from '../../.generate/i18n.generated';
import { i18nValidationMessage } from 'nestjs-i18n';

export class UpdatePwdAdminDto extends PartialType(CreateUserDto) {
  email: string;
  @IsNotEmpty({
    message: i18nValidationMessage<I18nTranslations>('validation.NOT_EMPTY'),
  })
  newPassword: string;
  confirmNewPassword?: string;
}
