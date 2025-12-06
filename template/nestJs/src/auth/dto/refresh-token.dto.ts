import { IsNotEmpty } from "class-validator";

export class RefreshToken {
  @IsNotEmpty()
  token: string;
}
