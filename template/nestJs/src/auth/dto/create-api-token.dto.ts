import { IsEmail, IsString, IsOptional } from 'class-validator';

export class CreateApiTokenDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  tokenName?: string; // 可选的token名称，用于标识
}
