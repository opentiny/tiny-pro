import { JwtService } from '@nestjs/jwt';
import { toTokenId } from './entity';
import { ConfigureService } from '@app/configure';
import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { FindUserForAuthenticationQuery, GetAllApiTokens } from './queries';
import { CreateApiTokenDto } from './dto';
import { PasswordIncorrect } from '../user';
import { IssueApiToken, RevokeApiToken } from './commands';

@Injectable()
export class ApiTokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigureService,
    private readonly qb: QueryBus,
    private readonly cb: CommandBus,
  ) {}

  createApiTokenDetail(email: string, tokenName?: string) {
    const tokenId = tokenName
      ? toTokenId(tokenName)
      : `api_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const ttl = this.configService.get('auth.apiTokenTTL');
    const payload = { email, type: 'api' };
    const token = this.jwtService.sign(payload, { expiresIn: ttl });
    return {
      token,
      tokenId,
      expiresIn: ttl,
    };
  }
  async validateApiToken(email: string, token: string): Promise<boolean> {
    const tokens = await this.qb.execute(new GetAllApiTokens(email));
    return tokens.includes(token);
  }

  async issueApiToken(body: CreateApiTokenDto) {
    const user = await this.qb.execute(
      new FindUserForAuthenticationQuery(body.email),
    );
    if (!user.verifyPassword(body.password)) {
      throw new PasswordIncorrect();
    }
    const apiTokenDetail = this.createApiTokenDetail(
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
}
