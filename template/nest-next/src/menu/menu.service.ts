import { Injectable } from '@nestjs/common';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateMenu, RemoveMenu, UpdateMenu } from './commands';
import { FindAllMenu } from './queries';

@Injectable()
export class MenuService {
  constructor(
    private readonly qb: QueryBus,
    private readonly cb: CommandBus,
  ) {}
  create(createMenuDto: CreateMenuDto) {
    return this.cb.execute(new CreateMenu(createMenuDto));
  }

  findAll() {
    return this.qb.execute(new FindAllMenu());
  }

  update(updateMenuDto: UpdateMenuDto) {
    return this.cb.execute(new UpdateMenu(updateMenuDto));
  }

  remove(id: number) {
    return this.cb.execute(new RemoveMenu(id));
  }
}
