import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { LoginDto } from './dto';
import {
  AccessTokenPayload,
  RefreshTokenPayload,
  TokenPair,
  TokenPayload,
} from './entity';
import { FindUserForAuthenticationQuery, GetTokenDataQuery } from './queries';
import { IssueToken, RevokeToken } from './commands';
import { TokenExpired } from './errors/token-expired.error';
import { PasswordIncorrect } from '../user';
import {
  JsonWebTokenError,
  JwtService,
  NotBeforeError,
  TokenExpiredError,
} from '@nestjs/jwt';
import { InvalidToken } from './errors';
import { toUserId } from 'src/user/user.entity';
import { RefreshToken } from './commands/refresh-token.command';
import { GetToken } from './queries/get-token';

@Injectable()
export class AuthService {
  constructor(
    private readonly cb: CommandBus,
    private readonly qb: QueryBus,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.qb.execute(
      new FindUserForAuthenticationQuery(dto.email),
    );
    if (!user.verifyPassword(dto.password)) {
      throw new PasswordIncorrect();
    }
    const tokenData = await this.qb.execute(
      new GetTokenDataQuery(user.id, user.email),
    );
    await this.cb.execute(new IssueToken(user.id, tokenData));
    return new TokenPair({
      accessToken: tokenData.accessToken,
      refreshToken: tokenData.refreshToken,
      accessTokenTTL: Math.floor(tokenData.accessTokenTTL * 1000),
      refreshTokenTTL: Math.floor(tokenData.refreshTokenTTL * 1000),
    });
  }

  async logout(token: string) {
    try {
      await this.cb.execute(new RevokeToken(token));
    } catch (e) {
      const err = e as Error;
      throw new TokenExpired(err);
    }
  }

  async refreshToken(maybeToken: string) {
    const tokenPayload = this.jwtService.decode<TokenPayload>(maybeToken);
    if (!('accessTokenJti' in tokenPayload)) {
      throw new InvalidToken();
    }
    const sessionId = tokenPayload.sessionId;
    const uid = tokenPayload.id;
    const tokenData = await this.qb.execute(
      new GetTokenDataQuery(toUserId(uid), tokenPayload.email),
    );
    return this.cb.execute(
      new RefreshToken(tokenData, sessionId, toUserId(uid)),
    );
  }

  async tokenAlive(userToken: string) {
    await this.jwtService.verifyAsync(userToken).catch((reason) => {
      const err = reason as JsonWebTokenError;
      if (err instanceof TokenExpiredError) {
        throw new TokenExpired();
      }
      if (err instanceof NotBeforeError) {
        throw new InvalidToken();
      }
    });
    const { jti } = this.jwtService.decode<
      RefreshTokenPayload | AccessTokenPayload
    >(userToken);
    const token = await this.qb.execute(new GetToken({ jti }));
    return Boolean(token);
  }
}
