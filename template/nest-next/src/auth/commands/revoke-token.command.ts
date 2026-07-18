import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { RedisSessionRepository } from '../repository/redis-session.repository';
import { TokenPayload } from '../entity/token.entity';
import { InvalidToken } from '../errors';

export class RevokeToken extends Command<void> {
  constructor(public readonly token: string) {
    super();
  }
}

@CommandHandler(RevokeToken)
export class RevokeTokenService implements ICommandHandler<RevokeToken> {
  constructor(
    private readonly jwt: JwtService,
    private readonly sessionRepo: RedisSessionRepository,
  ) {}
  async execute({ token }: RevokeToken): Promise<void> {
    const payload = this.jwt.decode<TokenPayload>(token);
    if ('accessTokenJti' in payload) {
      throw new InvalidToken();
    }
    if ('type' in payload) {
      throw new InvalidToken();
    }
    const { id, sessionId } = payload;
    try {
      await this.sessionRepo.revokeSession(id, sessionId);
    } catch (e) {
      const msg = (e as Error).message;
      if (msg.includes('SESSION_NOT_FOUND')) {
        throw new InvalidToken();
      }
    }
  }
}
