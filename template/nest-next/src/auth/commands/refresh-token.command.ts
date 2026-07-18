import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TokenPair } from '../entity';
import { RedisSessionRepository } from '../repository/redis-session.repository';
import { TokenData } from '../queries';
import { UserId } from 'src/user';

export class RefreshToken extends Command<TokenPair> {
  constructor(
    public readonly tokenData: TokenData,
    public readonly oldSessionId: string,
    public readonly uid: UserId,
  ) {
    super();
  }
}

@CommandHandler(RefreshToken)
export class RefreshTokenService implements ICommandHandler<RefreshToken> {
  constructor(private readonly sessionRepo: RedisSessionRepository) {}
  async execute(command: RefreshToken): Promise<TokenPair> {
    const { tokenData, oldSessionId, uid } = command;
    await this.sessionRepo.refreshToken(
      uid,
      tokenData.sessionId,
      tokenData.sessionIssueAt.toString(),
      oldSessionId,
      tokenData.accessTokenJTI.toString(),
      tokenData.refreshTokenJTI.toString(),
      tokenData.accessToken.toString(),
      tokenData.refreshToken.toString(),
      tokenData.accessTokenTTL.toString(),
      tokenData.refreshTokenTTL.toString(),
    );
    return new TokenPair({
      accessToken: tokenData.accessToken.toString(),
      refreshToken: tokenData.refreshToken.toString(),
      accessTokenTTL: tokenData.accessTokenTTL * 1000,
      refreshTokenTTL: tokenData.refreshTokenTTL * 1000,
    });
  }
}
