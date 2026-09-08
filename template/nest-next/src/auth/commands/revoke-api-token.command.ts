import { RedisService } from '@liaoliaots/nestjs-redis';
import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class RevokeApiToken extends Command<void> {
  constructor(
    public readonly email: string,
    public readonly tokenId: string,
  ) {
    super();
  }
}

@CommandHandler(RevokeApiToken)
export class RevokeApiTokenService implements ICommandHandler<RevokeApiToken> {
  constructor(private readonly redisService: RedisService) {}
  async execute({ email, tokenId }: RevokeApiToken): Promise<void> {
    const redis = this.redisService.getOrThrow();
    await redis.del(`user:${email}:$api:${tokenId}`);
    return Promise.resolve();
  }
}
