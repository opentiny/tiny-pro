import { Command, CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UpdateMenuDto, UpdateMenuResponse } from "../dto/update-menu.dto";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Menu } from "../menu.entity";
import { EntityRepository } from "@mikro-orm/mysql";
import { MenuNotFound } from "../errors/menu-not-found";

export class UpdateMenu extends Command<UpdateMenuResponse> {
  constructor(
    public readonly dto: UpdateMenuDto
  ){
    super()
  }
}

@CommandHandler(UpdateMenu)
export class UpdateMenuCommandHandler implements ICommandHandler<UpdateMenu>{
  constructor(
    @InjectRepository(Menu)
    private readonly menuRepo: EntityRepository<Menu>
  ){}
  async execute(command: UpdateMenu): Promise<UpdateMenuResponse> {
    const menu = await this.menuRepo.findOne({
      id: command.dto.id
    });
    if (!menu) {
      throw new MenuNotFound();
    }
    for (const key of Object.keys(command.dto)) {
      if (command.dto[key] !== undefined) {
        menu[key] = command.dto[key];
      }
    }
    await this.menuRepo.upsert(menu);
    return new UpdateMenuResponse({id: menu.id})
  }
}