import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsNotEmpty } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { I18nTranslations } from '../../.generate/i18n.generated';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePwdUserDto extends PartialType(CreateUserDto) {
  @ApiPropertyOptional({
    description: '电子邮箱'
  })
  email: string;
  @ApiPropertyOptional({
    description: 'AccessToken'
  })
  token: string;

  @ApiProperty({
    description: '新密码'
  })
  @IsNotEmpty({
    message: i18nValidationMessage<I18nTranslations>('validation.NOT_EMPTY'),
  })
  newPassword: string;

  @ApiProperty({
    description: '老密码'
  })
  @IsNotEmpty({
    message: i18nValidationMessage<I18nTranslations>('validation.NOT_EMPTY'),
  })
  oldPassword?: string;
}
