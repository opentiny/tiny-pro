import {
  Command,
  CommandHandler,
  EventBus,
  ICommandHandler,
} from '@nestjs/cqrs';
import { User, UserId } from '../user.entity';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/core';
import { UserNotFound } from '../error';
import { UserPasswordChangedEvent } from '../events';

export class UpdateUserPassword extends Command<UserId> {
  constructor(
    public readonly email: string,
    public readonly password: string,
  ) {
    super();
  }
}

@CommandHandler(UpdateUserPassword)
export class UpdateUserPasswordService implements ICommandHandler<UpdateUserPassword> {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>,
    private readonly eventBus: EventBus,
  ) {}
  async execute(command: UpdateUserPassword): Promise<UserId> {
    const user = await this.userRepository.findOne({ email: command.email });
    if (!user) {
      throw new UserNotFound();
    }
    user.changePassword(command.password);
    await this.userRepository.upsert(user);
    await this.eventBus.publish(new UserPasswordChangedEvent(user.id));
    return user.id;
  }
}
