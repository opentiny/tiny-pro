import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsNotEmpty } from 'class-validator';
import { I18nTranslations } from '../../.generate/i18n.generated';
import { i18nValidationMessage } from 'nestjs-i18n';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePwdAdminDto extends PartialType(CreateUserDto) {
  @ApiProperty({
    description: '目标用户的电子邮箱'
  })
  email: string;

  @ApiProperty({
    description: '新密码'
  })
  @IsNotEmpty({
    message: i18nValidationMessage<I18nTranslations>('validation.NOT_EMPTY'),
  })
  newPassword: string;
  @ApiPropertyOptional({
    description: '确认密码'
  })
  confirmNewPassword?: string;
}
