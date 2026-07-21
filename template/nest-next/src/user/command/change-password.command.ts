import {
  Command,
  CommandHandler,
  EventBus,
  ICommandHandler,
} from '@nestjs/cqrs';
import { User, UserId } from '../user.entity';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/core';
import { UserNotFound, PasswordIncorrect } from '../error';
import { UserPasswordChangedEvent } from '../events';

export class ChangePassword extends Command<UserId> {
  constructor(
    public readonly email: string,
    public readonly oldPassword: string,
    public readonly password: string,
    public readonly confirmPassword: string,
  ) {
    super();
  }
}

@CommandHandler(ChangePassword)
export class ChangePasswordService implements ICommandHandler<ChangePassword> {
  async execute(command: ChangePassword): Promise<UserId> {
    const user = await this.userRepository.findOne({ email: command.email });
    if (!user) {
      throw new UserNotFound();
    }
    if (!user.verifyPassword(command.oldPassword)) {
      throw new PasswordIncorrect();
    }
    user.changePassword(command.password);
    await this.userRepository.upsert(user);
    await this.eventBus.publish(new UserPasswordChangedEvent(user.id));
    return user.id;
  }
  constructor(
    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>,
    private readonly eventBus: EventBus,
  ) {}
}
