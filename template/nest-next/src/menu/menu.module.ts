import { Module } from '@nestjs/common';
import { MenuService } from './menu.service';
import { MenuController } from './menu.controller';
import {
  CreateMenuHandler,
  RemoveMenuCommandHandler,
  UpdateMenuCommandHandler,
} from './commands';
import { FindAllMenuQueryHandler, FindMenuHandler } from './queries';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Menu } from './menu.entity';

@Module({
  imports: [MikroOrmModule.forFeature([Menu])],
  controllers: [MenuController],
  providers: [
    MenuService,
    CreateMenuHandler,
    RemoveMenuCommandHandler,
    UpdateMenuCommandHandler,
    FindAllMenuQueryHandler,
    FindMenuHandler
  ],
})
export class MenuModule {}
