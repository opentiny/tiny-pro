import { IsNotEmpty } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { I18nTranslations } from '../../.generate/i18n.generated';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: '用户名称'
  })
  @IsNotEmpty({
    message: i18nValidationMessage<I18nTranslations>('validation.NOT_EMPTY'),
  })
  name: string;

  @ApiProperty({
    description: '用户邮箱, 登陆时用'
  })
  @IsNotEmpty({
    message: i18nValidationMessage<I18nTranslations>('validation.NOT_EMPTY'),
  })
  email: string;

  @ApiProperty({
    description: '用户密码, 登陆时用'
  })
  @IsNotEmpty({
    message: i18nValidationMessage<I18nTranslations>('validation.NOT_EMPTY'),
  })
  password: string;
  @ApiProperty({
    description: '用户角色'
  })
  roleIds: number[] = [];
  @ApiProperty({})
  department?: string;
  @ApiProperty({})
  employeeType?: string;
  @ApiProperty({})
  probationStart?: string;
  @ApiProperty({})
  probationEnd?: string;
  @ApiProperty({})
  probationDuration?: string;
  @ApiProperty({})
  protocolStart?: string;
  @ApiProperty({})
  protocolEnd?: string;
  @ApiProperty({})
  address?: string;
  @ApiProperty({})
  status?: number;
}
