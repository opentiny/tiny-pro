import { IsEmail, IsString } from 'class-validator';

export class RevokeApiTokenDto {
  @IsEmail()
  email: string;

  @IsString()
  tokenId: string;
}
