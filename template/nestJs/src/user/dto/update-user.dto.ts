import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsNotEmpty } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { I18nTranslations } from '../../.generate/i18n.generated';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  oldPassword: string;
  newPassword: string;
  @IsNotEmpty({
    message: i18nValidationMessage<I18nTranslations>('validation.NOT_EMPTY'),
  })
  email: string;
  roleIds: number[] = [];
  department: string;
  employeeType: string;
  probationStart: string;
  probationEnd: string;
  probationDuration: string;
  protocolStart: string;
  protocolEnd: string;
  address: string;
  status: number;
  @IsNotEmpty({
    message: i18nValidationMessage<I18nTranslations>('validation.NOT_EMPTY'),
  })
  name: string;
}
