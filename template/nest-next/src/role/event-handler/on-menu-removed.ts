import { CommandBus, EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { MenuRemoved } from '../../menu';
import { UnbindMenuCommand } from '../commands';

@EventsHandler(MenuRemoved)
export class OnMenuRemoved implements IEventHandler<MenuRemoved> {
  constructor(private readonly cb: CommandBus) {}
  async handle(event: MenuRemoved) {
    await this.cb.execute(new UnbindMenuCommand(event.menuId));
  }
}
