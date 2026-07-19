import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsOptional } from 'class-validator';

export class CreateApiTokenDto {
  @ApiProperty({
    description: '邮箱'
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: '密码'
  })
  @IsString()
  password: string;

  @ApiProperty({
    description: '令牌名称'
  })
  @IsOptional()
  @IsString()
  tokenName?: string; // 可选的token名称，用于标识
}
