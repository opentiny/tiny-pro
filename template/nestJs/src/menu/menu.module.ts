import { Module } from '@nestjs/common';
import { MenuService } from './menu.service';
import { MenuController } from './menu.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Menu, Role, User } from '@app/models';
import { MenuInitializer } from './menu.initializer';

@Module({
  imports: [TypeOrmModule.forFeature([Menu, User, Role])],
  controllers: [MenuController],
  providers: [MenuService, MenuInitializer],
  exports: [MenuService, MenuInitializer],
})
export class MenuModule {}
