import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MenuId } from '../../menu';
import { RoleMenu } from '../role.entity';
import { EntityRepository } from '@mikro-orm/mysql';
import { InjectRepository } from '@mikro-orm/nestjs';

export class UnbindMenuCommand extends Command<void> {
  constructor(public readonly menuId: MenuId) {
    super();
  }
}

@CommandHandler(UnbindMenuCommand)
export class UnbindMenuCommandHandler implements ICommandHandler<UnbindMenuCommand> {
  constructor(
    @InjectRepository(RoleMenu)
    private readonly roleMenu: EntityRepository<RoleMenu>,
  ) {}
  async execute({ menuId }: UnbindMenuCommand): Promise<void> {
    await this.roleMenu.nativeDelete({
      menuId,
    });
    return;
  }
}
