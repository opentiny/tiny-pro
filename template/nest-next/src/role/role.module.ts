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
  UnbindMenuCommandHandler,
  UnbindPermissionHandler,
  UpdateRoleHandler,
} from './commands';
import { OnPermissionRemoved } from './event-handler';
import { OnMenuRemoved } from './event-handler/on-menu-removed';
import { UserRole } from '../user';

@Module({
  imports: [
    MikroOrmModule.forFeature([Role, RoleMenu, RolePermission, UserRole]),
  ],
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
    UnbindMenuCommandHandler,
    OnPermissionRemoved,
    OnMenuRemoved,
  ],
})
export class RoleModule {}
