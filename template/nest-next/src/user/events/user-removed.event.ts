import { UserId } from '../user.entity';

export class UserRemovedEvent {
  constructor(public userId: UserId) {}
}
