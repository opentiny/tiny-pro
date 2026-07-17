import { ApiProperty } from "@nestjs/swagger";
import { v7 } from "uuid";

export type ApiTokenPayload = {
  type: 'api';
  email: string;
}
export type Jti = string & {readonly __brand: unique symbol}
export const toJti = (val: string) => val as Jti;
export const createJti = () => v7() as Jti;
export type TokenPayload = ApiTokenPayload | AccessTokenPayload;
export type TokenPayloadBase = {
  jti: Jti;
  issueAt: number;
  ttl: number;
}
export type AccessTokenPayload = TokenPayloadBase & {
  id: string;
  email: string;
  refreshTokenJti: string;
}
export type RefreshTokenPayload = TokenPayloadBase & {
  id: string;
  email: string;
  accessTokenJti: string;
}


export class TokenPair {
  @ApiProperty({
    description: '访问令牌, 标准的JWT格式, 不带 `Bearer `',
  })
  accessToken: string;
  @ApiProperty({
    description: '刷新令牌, 标准的JWT格式, 不带 `Bearer `'
  })
  refreshToken: string;
  @ApiProperty({
    description: '访问令牌有效期, 单位是毫秒'
  })
  accessTokenTTL: number;
  @ApiProperty({
    description: '刷新令牌有效期, 单位是毫秒'
  })
  refreshTokenTTL: number;
}

export class ApiToken {
  @ApiProperty({})
  token: string;
  @ApiProperty({})
  tokenId: string;
  @ApiProperty({
    description: '有效期'
  })
  expiresIn: number;
}
