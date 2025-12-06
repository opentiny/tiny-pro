import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class RefreshToken {
  @ApiProperty({
    description: 'RefreshToken'
  })
  @IsNotEmpty()
  token: string;
}
