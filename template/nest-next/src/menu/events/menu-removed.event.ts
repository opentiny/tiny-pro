import { MenuId } from '../menu.entity';

export class MenuRemoved {
  constructor(public readonly menuId: MenuId) {}
}
