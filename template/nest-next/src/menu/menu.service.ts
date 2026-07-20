import { Injectable } from '@nestjs/common';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateMenu, RemoveMenu, UpdateMenu } from './commands';
import { convertToTree, FindAllMenu } from './queries';
import { MenuId } from './menu.entity';
import { GetUserInfo } from '../user/query';
import { UserNotFound } from '../user';

@Injectable()
export class MenuService {
  constructor(
    private readonly qb: QueryBus,
    private readonly cb: CommandBus,
  ) {}
  async findUserMenu(email: string) {
    const [userInfo] = await this.cb.execute(
      new GetUserInfo({ email: [email] }),
    );
    if (!userInfo) {
      throw new UserNotFound();
    }
    const menus = userInfo.role.flatMap((role) => role.menus);
    const maps = {};
    menus.forEach((menu) => {
      maps[menu.id] = menu;
    });
    return convertToTree(Object.values(maps));
  }
  create(createMenuDto: CreateMenuDto) {
    return this.cb.execute(new CreateMenu(createMenuDto));
  }

  findAll() {
    return this.qb.execute(new FindAllMenu());
  }

  update(updateMenuDto: UpdateMenuDto) {
    return this.cb.execute(new UpdateMenu(updateMenuDto));
  }

  remove(id: MenuId) {
    return this.cb.execute(new RemoveMenu(id));
  }
}
