import { UserId } from '../user.entity';

export class UserCreatedEvent {
  constructor(public userId: UserId) {}
}
