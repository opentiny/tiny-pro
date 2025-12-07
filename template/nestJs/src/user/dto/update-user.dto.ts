import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsNotEmpty } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { I18nTranslations } from '../../.generate/i18n.generated';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiPropertyOptional({
    description: '老密码'
  })
  oldPassword: string;
  @ApiPropertyOptional({
    description: '新密码'
  })
  newPassword: string;

  @ApiProperty({
    description: '电子邮箱'
  })
  @IsNotEmpty({
    message: i18nValidationMessage<I18nTranslations>('validation.NOT_EMPTY'),
  })
  email: string;
  @ApiProperty({
    description: '角色id',
    type: [Number]
  })
  roleIds: number[] = [];
  @ApiPropertyOptional()
  department: string;
  @ApiPropertyOptional()
  employeeType: string;
  @ApiPropertyOptional()
  probationStart: string;
  @ApiPropertyOptional()
  probationEnd: string;
  @ApiPropertyOptional()
  probationDuration: string;
  @ApiPropertyOptional()
  protocolStart: string;
  @ApiPropertyOptional()
  protocolEnd: string;
  @ApiPropertyOptional()
  address: string;
  @ApiPropertyOptional()
  status: number;
  @IsNotEmpty({
    message: i18nValidationMessage<I18nTranslations>('validation.NOT_EMPTY'),
  })
  name: string;
}
