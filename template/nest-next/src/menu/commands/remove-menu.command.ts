import { Command, CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { MenuInfo } from "../dto/menu-info.dto";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Menu } from "../menu.entity";
import { EntityRepository, EntityManager } from "@mikro-orm/core";
import { MenuNotFound } from "../errors/menu-not-found";

export class RemoveMenu extends Command<MenuInfo> {
  constructor(
    public id: number
  ){
    super();
  }
}

@CommandHandler(Menu)
export class RemoveMenuCommandHandler implements ICommandHandler<RemoveMenu>{
  constructor(
    @InjectRepository(Menu)
    private readonly menu: EntityRepository<Menu>,
  ){}
  async execute({id}: RemoveMenu): Promise<MenuInfo> {
    const menu = await this.menu.findOne({id}, {cache: true});
    if (!menu) {
      throw new MenuNotFound();
    }
    const menuChildren = await this.menu.find({
      parentId: menu.id
    });
    if (menuChildren.length) {
      menuChildren.forEach((child) => {
        child.parentId = menu.parentId;
      })
      await this.menu.upsertMany(menuChildren);
    }
    await this.menu.nativeDelete({ id: menu.id });
    this.menu.getEntityManager().clear();
    return menu;
  }
}