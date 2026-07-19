import { RedisService } from '@liaoliaots/nestjs-redis';
import { Injectable } from '@nestjs/common';
import { ApiTokenId, Jti } from '../entity';

@Injectable()
export class TokenRepository {
  constructor(private readonly redisSrv: RedisService) {}
  getTokenByJti(jti: Jti) {
    const redis = this.redisSrv.getOrThrow();
    return redis.get(`token:${jti}`);
  }
  async setApiToken(
    email: string,
    tokenId: ApiTokenId,
    token: string,
    ttl: number,
  ) {
    const redis = this.redisSrv.getOrThrow();
    await redis.set(`user:${email}:api:${tokenId}`, token, 'EX', ttl);
  }
}
