import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateApiTokenDto, LoginDto } from './dto';
import { TokenPair, TokenPayload } from './entity';
import { FindUserForAuthenticationQuery, GetTokenDataQuery } from './queries';
import {
  IssueApiToken,
  IssueToken,
  RevokeApiToken,
  RevokeToken,
} from './commands';
import { TokenExpired } from './errors/token-expired.error';
import { PasswordIncorrect } from '../user';
import { ApiTokenService } from './api-token.service';
import { JwtService } from '@nestjs/jwt';
import { InvalidToken } from './errors';
import { toUserId } from 'src/user/user.entity';
import { RefreshToken } from './commands/refresh-token.command';

@Injectable()
export class AuthService {
  constructor(
    private readonly cb: CommandBus,
    private readonly qb: QueryBus,
    private readonly apiTokenService: ApiTokenService,
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

  async issueApiToken(body: CreateApiTokenDto) {
    const user = await this.qb.execute(
      new FindUserForAuthenticationQuery(body.email),
    );
    if (!user.verifyPassword(body.password)) {
      throw new PasswordIncorrect();
    }
    const apiTokenDetail = this.apiTokenService.createApiTokenDetail(
      body.email,
      body.tokenName,
    );
    await this.cb.execute(
      new IssueApiToken(
        body.email,
        apiTokenDetail.tokenId,
        apiTokenDetail.token,
        apiTokenDetail.expiresIn,
      ),
    );
    return apiTokenDetail;
  }
  async revokeApiToken(email: string, tokenId: string) {
    await this.cb.execute(new RevokeApiToken(email, tokenId));
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
}
