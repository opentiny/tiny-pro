import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import {
  AccessTokenPayload,
  createJti,
  createSessionId,
  RefreshTokenPayload,
} from '../entity/token.entity';
import { UserId } from '../../user';
import { JwtService } from '@nestjs/jwt';
import { ConfigureService } from '@app/configure';

export type TokenData = {
  sessionId: string;
  sessionIssueAt: number;
  accessToken: string;
  refreshToken: string;
  accessTokenPayload: AccessTokenPayload;
  refreshTokenPayload: RefreshTokenPayload;
  accessTokenTTL: number;
  refreshTokenTTL: number;
  accessTokenJTI: string;
  refreshTokenJTI: string;
};

export class GetTokenDataQuery extends Query<TokenData> {
  constructor(
    public readonly uid: UserId,
    public readonly email: string,
  ) {
    super();
  }
}

@QueryHandler(GetTokenDataQuery)
export class GetTokenDataService implements IQueryHandler<GetTokenDataQuery> {
  constructor(
    private readonly jwt: JwtService,
    private readonly cfg: ConfigureService,
  ) {}
  execute(query: GetTokenDataQuery): Promise<TokenData> {
    const { uid, email } = query;
    const { accessTokenTTL, refreshTokenTTL } = this.cfg.get('auth');
    const jti = { access: createJti(), refresh: createJti() };
    const sessionId = createSessionId();
    const accessTokenPayload: AccessTokenPayload = {
      sessionId,
      jti: jti.access,
      id: uid.toString(),
      email,
      ttl: accessTokenTTL, // seconds
      issueAt: Math.floor(new Date().getTime() / 1000),
      refreshTokenJti: jti.refresh,
    };
    const refreshTokenPayload: RefreshTokenPayload = {
      sessionId,
      jti: jti.refresh,
      id: uid.toString(),
      email,
      ttl: refreshTokenTTL, // seconds
      issueAt: Math.floor(new Date().getTime() / 1000),
      accessTokenJti: jti.access,
    };
    const accessToken = this.jwt.sign(accessTokenPayload, {
      expiresIn: accessTokenTTL,
    });
    const refreshToken = this.jwt.sign(refreshTokenPayload, {
      expiresIn: refreshTokenTTL,
    });
    const tokenData: TokenData = {
      sessionId,
      sessionIssueAt: Math.floor(new Date().getTime() / 1000),
      accessToken,
      refreshToken,
      accessTokenPayload,
      refreshTokenPayload,
      accessTokenTTL,
      refreshTokenTTL,
      accessTokenJTI: jti.access,
      refreshTokenJTI: jti.refresh,
    };
    return Promise.resolve(tokenData);
  }
}
