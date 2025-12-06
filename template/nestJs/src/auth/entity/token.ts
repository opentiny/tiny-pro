import { ApiProperty } from "@nestjs/swagger";

export type ApiTokenPayload = {
  type: 'api';
  email: string;
}
export type TokenPayload = ApiTokenPayload | AccessTokenPayload;
export type TokenPayloadBase = {
  jti: string;
  issueAt: string;
  ttl: number;
}
export type AccessTokenPayload = TokenPayloadBase & {
  id: number;
  email: string;
  refreshTokenJti: string;
}
export type RefreshTokenPayload = TokenPayloadBase & {
  id: number;
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
