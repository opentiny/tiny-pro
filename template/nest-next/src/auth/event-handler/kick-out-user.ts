import { CommandBus, EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { UserPasswordChangedEvent, UserRemovedEvent } from '../../user';
import { RevokeAllUserSession } from '../commands';

@EventsHandler(UserRemovedEvent, UserPasswordChangedEvent)
export class KickoutUserEventHandler implements IEventHandler<UserRemovedEvent> {
  constructor(private readonly cb: CommandBus) {}
  async handle(event: UserRemovedEvent) {
    await this.cb.execute(new RevokeAllUserSession(event.userId));
  }
}
