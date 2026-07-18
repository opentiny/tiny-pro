import { RedisService } from '@liaoliaots/nestjs-redis';
import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class IssueApiToken extends Command<void> {
  constructor(
    public readonly email: string,
    public readonly tokenId: string,
    public readonly token: string,
    public readonly ttl: number,
  ) {
    super();
  }
}

@CommandHandler(IssueApiToken)
export class IssueApiTokenService implements ICommandHandler<IssueApiToken> {
  constructor(private readonly redisService: RedisService) {}
  async execute(command: IssueApiToken): Promise<void> {
    const redis = this.redisService.getOrThrow();
    await redis.set(command.tokenId, command.token, 'EX', command.ttl);
    return Promise.resolve();
  }
}
