import { IsNotEmpty } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { I18nTranslations } from '../../.generate/i18n.generated';
import { ApiProperty } from '@nestjs/swagger';
import { RoleId } from 'src/role';

export class CreateUserDto {
  @ApiProperty({
    description: '用户名称',
  })
  @IsNotEmpty({
    message: i18nValidationMessage<I18nTranslations>('validation.NOT_EMPTY'),
  })
  name: string;

  @ApiProperty({
    description: '用户邮箱, 登陆时用',
  })
  @IsNotEmpty({
    message: i18nValidationMessage<I18nTranslations>('validation.NOT_EMPTY'),
  })
  email: string;

  @ApiProperty({
    description: '用户密码, 登陆时用',
  })
  @IsNotEmpty({
    message: i18nValidationMessage<I18nTranslations>('validation.NOT_EMPTY'),
  })
  password: string;
  @ApiProperty({
    description: '用户角色',
  })
  roleIds: RoleId[] = [];
  @ApiProperty({ required: false })
  department?: string;
  @ApiProperty({ required: false })
  employeeType?: string;
  @ApiProperty({ required: false })
  probationStart?: string;
  @ApiProperty({ required: false })
  probationEnd?: string;
  @ApiProperty({ required: false })
  probationDuration?: string;
  @ApiProperty({ required: false })
  protocolStart?: string;
  @ApiProperty({ required: false })
  protocolEnd?: string;
  @ApiProperty({ required: false })
  address?: string;
  @ApiProperty({ required: false })
  status?: number;
}
