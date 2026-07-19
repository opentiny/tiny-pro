import { Command, ICommandHandler } from '@nestjs/cqrs';
import { UserId } from '../../user';
import { RedisSessionRepository } from '../repository/redis-session.repository';

export class RevokeAllUserSession extends Command<void> {
  constructor(public readonly uid: UserId) {
    super();
  }
}

export class RevokeAllUserSessionService implements ICommandHandler<RevokeAllUserSession> {
  constructor(private readonly sessionRepository: RedisSessionRepository) {}

  async execute(command: RevokeAllUserSession) {
    await this.sessionRepository.revokeAllSession(command.uid);
  }
}
