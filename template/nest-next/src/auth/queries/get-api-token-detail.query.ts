import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { ApiTokenId, createApiTokenId, toTokenId } from '../entity';
import { ConfigureService } from '@app/configure';
import { JwtService } from '@nestjs/jwt';

export type ApiTokenDetail = {
  token: string;
  tokenId: ApiTokenId;
  ttl: number;
};

export class GetApiTokenDetail extends Query<ApiTokenDetail> {
  constructor(
    public readonly email: string,
    public readonly tokenName?: string,
  ) {
    super();
  }
}

@QueryHandler(GetApiTokenDetail)
export class GetApiTokenService implements IQueryHandler<GetApiTokenDetail> {
  constructor(
    private readonly cfg: ConfigureService,
    private readonly jwt: JwtService,
  ) {}
  execute(query: GetApiTokenDetail): Promise<ApiTokenDetail> {
    const ttl = this.cfg.get('auth.apiTokenTTL');
    const payload = { email: query.email, type: 'api' };
    const token = this.jwt.sign(payload, { expiresIn: ttl });
    const tokenId = query.tokenName
      ? toTokenId(query.tokenName)
      : createApiTokenId();
    return Promise.resolve({ token, tokenId, ttl });
  }
}
