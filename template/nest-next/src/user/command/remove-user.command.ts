import {
  Command,
  CommandHandler,
  EventBus,
  ICommandHandler,
} from '@nestjs/cqrs';
import { User, UserId } from '../user.entity';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/core';
import { UserRemovedEvent } from '../events';

export class RemoveUser extends Command<UserId> {
  constructor(public readonly email: string) {
    super();
  }
}

@CommandHandler(RemoveUser)
export class RemoveUserService implements ICommandHandler<RemoveUser> {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>,
    private readonly eventBus: EventBus,
  ) {}
  async execute({ email }: RemoveUser): Promise<UserId> {
    const user = await this.userRepository.findOneOrFail({
      email,
    });
    await this.userRepository.nativeDelete({
      email,
    });
    await this.eventBus.publish(new UserRemovedEvent(user.id));
    return user.id;
  }
}
