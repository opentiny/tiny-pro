import { Module } from '@nestjs/common';
import { MenuService } from './menu.service';
import { MenuController } from './menu.controller';
import {
  CreateMenuHandler,
  RemoveMenuCommandHandler,
  UpdateMenuCommandHandler,
} from './commands';
import {
  FindAllMenuQueryHandler,
  FindMenuHandler,
  GetUserMenuService,
} from './queries';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Menu } from './menu.entity';
import { User } from '../user';
import { RoleMenu } from '../role';

@Module({
  imports: [MikroOrmModule.forFeature([Menu, User, RoleMenu])],
  controllers: [MenuController],
  providers: [
    MenuService,
    CreateMenuHandler,
    RemoveMenuCommandHandler,
    UpdateMenuCommandHandler,
    FindAllMenuQueryHandler,
    FindMenuHandler,
    GetUserMenuService,
  ],
})
export class MenuModule {}
