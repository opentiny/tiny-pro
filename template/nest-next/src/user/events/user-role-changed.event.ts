import { UserId } from '../user.entity';

export class UserUserRoleChangedEvent {
  constructor(public userId: UserId) {}
}
