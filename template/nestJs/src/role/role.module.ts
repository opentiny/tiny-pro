import { Module } from '@nestjs/common';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Menu, Permission, Role, User } from '@app/models';
import { RoleInit } from './role.initializer';

@Module({
  controllers: [RoleController],
  providers: [RoleService, RoleInit],
  imports: [TypeOrmModule.forFeature([Role, Permission, Menu, User])],
  exports: [RoleService, RoleInit],
})
export class RoleModule {}
