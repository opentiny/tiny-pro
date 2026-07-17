import { UserId } from '../user.entity';

export class UserPasswordChangedEvent {
  constructor(public userId: UserId) {}
}
