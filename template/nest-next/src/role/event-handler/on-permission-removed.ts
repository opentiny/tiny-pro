import { CommandBus, EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { PermissionRemoved } from 'src/permission';
import { UnbindPermission } from '../commands';

@EventsHandler(PermissionRemoved)
export class OnPermissionRemoved implements IEventHandler<PermissionRemoved> {
  constructor(private readonly cb: CommandBus) {}
  async handle(event: PermissionRemoved) {
    await this.cb.execute(new UnbindPermission(event.id));
  }
}
