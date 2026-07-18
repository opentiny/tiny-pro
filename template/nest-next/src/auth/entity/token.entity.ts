import { ApiProperty } from '@nestjs/swagger';
import { v7 } from 'uuid';

export type ApiTokenPayload = {
  type: 'api';
  email: string;
};
export type Jti = string & { readonly __brand: unique symbol };
export type SessionId = string & { readonly __brand: unique symbol };
export const toJti = (val: string) => val as Jti;
export const createJti = () => v7() as Jti;
export const createSessionId = () => v7() as SessionId;
export const toSessionId = (val: string) => val as SessionId;
export type TokenPayload =
  | ApiTokenPayload
  | AccessTokenPayload
  | RefreshTokenPayload;
export type TokenPayloadBase = {
  sessionId: SessionId;
  jti: Jti;
  issueAt: number;
  ttl: number;
};
export type AccessTokenPayload = TokenPayloadBase & {
  id: string;
  email: string;
  refreshTokenJti: string;
};
export type RefreshTokenPayload = TokenPayloadBase & {
  id: string;
  email: string;
  accessTokenJti: string;
};

export class TokenPair {
  @ApiProperty({
    description: '访问令牌, 标准的JWT格式, 不带 `Bearer `',
  })
  accessToken: string;
  @ApiProperty({
    description: '刷新令牌, 标准的JWT格式, 不带 `Bearer `',
  })
  refreshToken: string;
  @ApiProperty({
    description: '访问令牌有效期, 单位是毫秒',
  })
  accessTokenTTL: number;
  @ApiProperty({
    description: '刷新令牌有效期, 单位是毫秒',
  })
  refreshTokenTTL: number;

  constructor(props: TokenPair) {
    Object.assign(this, props);
  }
}

export type ApiTokenId = string & { readonly __brand: unique symbol };
export const toTokenId = (val: string) => val as ApiTokenId;
export const createApiTokenId = () =>
  `api_${Date.now()}_${Math.random().toString(36).substring(2, 11)}` as ApiTokenId;

export class ApiToken {
  @ApiProperty({})
  token: string;
  @ApiProperty({})
  tokenId: string;
  @ApiProperty({
    description: '有效期',
  })
  expiresIn: number;

  constructor(props: ApiToken) {
    Object.assign(this, props);
  }
}
