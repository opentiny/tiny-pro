import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserId } from 'src/user';
import { TokenData } from '../queries/get-token-data';
import { ConfigureService } from '@app/configure';
import { RedisSessionRepository } from '../repository/redis-session.repository';

export class IssueToken extends Command<void> {
  constructor(
    public readonly uid: UserId,
    public readonly token: TokenData,
  ) {
    super();
  }
}

@CommandHandler(IssueToken)
export class IssueTokenSerivce implements ICommandHandler<IssueToken> {
  constructor(
    private cfg: ConfigureService,
    private sessionRepo: RedisSessionRepository,
  ) {}
  async execute(command: IssueToken): Promise<void> {
    const sessionLimit =
      this.cfg.get('auth.session_limit') ??
      this.cfg.get('auth.device_limit') ??
      1;
    const { uid, token } = command;
    await this.sessionRepo.issueToken(
      token.sessionId,
      token.sessionIssueAt.toString(),
      uid,
      token.accessTokenJTI,
      token.accessToken,
      token.refreshToken,
      token.refreshTokenJTI,
      token.accessTokenTTL.toString(),
      token.refreshTokenTTL.toString(),
      sessionLimit.toString(),
    );
  }
}
