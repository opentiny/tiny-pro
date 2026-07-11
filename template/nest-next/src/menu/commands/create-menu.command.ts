import { Command, CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreateMenuDto } from "../dto/create-menu.dto";
import { EntityRepository } from "@mikro-orm/core";
import { Menu } from "../menu.entity";
import { InjectRepository } from "@mikro-orm/nestjs";
import { MenuExists } from "../errors/menu-exists";
import { MenuInfo } from "../dto/menu-info.dto";

export class CreateMenu extends Command<MenuInfo>{
  constructor(
    public readonly dto: CreateMenuDto
  ){
    super();
  }
}

@CommandHandler(CreateMenu)
export class CreateMenuHandler implements ICommandHandler<CreateMenu> {
  constructor(
    @InjectRepository(Menu)
    private readonly menuRepo: EntityRepository<Menu>,
  ) {}
  async execute({dto}: CreateMenu): Promise<MenuInfo> {
    const existingMenu = await this.menuRepo.findOne({
      ...dto
    })
    if (existingMenu) {
      throw new MenuExists(existingMenu.name);
    }
    const menu = this.menuRepo.create({
      name: dto.name,
      order: dto.order,
      menuType: dto.menuType,
      parentId: dto.parentId,
      icon: dto.icon,
      component: dto.component,
      path: dto.path,
      locale: dto.locale
    });
    await this.menuRepo.upsert(menu);
    return menu;
  }
}