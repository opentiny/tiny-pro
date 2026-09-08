import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { Jti } from '../entity';
import { TokenRepository } from '../repository/token.repository';
import { TokenExpired } from '../errors/token-expired.error';

export type GetTokenRequest = {
  jti: Jti;
};

export class GetToken extends Query<string> {
  constructor(public readonly req: GetTokenRequest) {
    super();
  }
}

@QueryHandler(GetToken)
export class GetTokenService implements IQueryHandler<GetToken> {
  constructor(private readonly tokenRepo: TokenRepository) {}
  async execute(query: GetToken): Promise<string> {
    const { jti } = query.req;
    const token = await this.tokenRepo.getTokenByJti(jti);
    if (!token) {
      throw new TokenExpired();
    }
    return token;
  }
}
