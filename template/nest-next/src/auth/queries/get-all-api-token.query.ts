import { RedisService } from '@liaoliaots/nestjs-redis';
import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';

export class GetAllApiTokens extends Query<string[]> {
  constructor(public readonly email: string) {
    super();
  }
}

@QueryHandler(GetAllApiTokens)
export class GetAllApiTokensService implements IQueryHandler<GetAllApiTokens> {
  constructor(private readonly redisService: RedisService) {}
  async execute({ email }: GetAllApiTokens): Promise<string[]> {
    const redis = this.redisService.getOrThrow();
    const keys = await redis.keys(`user:${email}:api:*`);
    if (keys.length === 0) return [];
    return (await redis.mget(...keys)).filter((value) => value !== null);
  }
}
