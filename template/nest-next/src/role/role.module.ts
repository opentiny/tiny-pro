import { Module } from '@nestjs/common';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { Role, RoleMenu, RolePermission } from './role.entity';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import {
  FindAllRoleHandler,
  FindRoleHandler,
  FindRoleMenuIdHandler,
  FindRolePermissionIdHandler,
  GetRoleTotalHandler,
} from './queries';
import {
  CreateRoleHandler,
  RemoveRoleHandler,
  UnbindPermissionHandler,
  UpdateRoleHandler,
} from './commands';
import { OnPermissionRemoved } from './event-handler';

@Module({
  imports: [MikroOrmModule.forFeature([Role, RoleMenu, RolePermission])],
  controllers: [RoleController],
  providers: [
    RoleService,
    FindAllRoleHandler,
    GetRoleTotalHandler,
    FindRoleMenuIdHandler,
    FindRolePermissionIdHandler,
    FindRoleHandler,
    CreateRoleHandler,
    UpdateRoleHandler,
    RemoveRoleHandler,
    UnbindPermissionHandler,
    OnPermissionRemoved,
  ],
})
export class RoleModule {}
