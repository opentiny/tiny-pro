import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class RevokeApiTokenDto {
  @ApiProperty({
    description: '电子邮箱'
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'TokenID'
  })
  @IsString()
  tokenId: string;
}
