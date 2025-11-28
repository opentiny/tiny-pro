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

