import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class RefreshTokenDTO {
  @ApiProperty({
    description: 'RefreshToken',
  })
  @IsNotEmpty()
  token: string;
}
