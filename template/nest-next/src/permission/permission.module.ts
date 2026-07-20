import { Module } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { PermissionController } from './permission.controller';
import {
  CreatePermissionHandler,
  RemovePermissionCommandHandler,
  UpdatePermissionHandler,
} from './commands';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Permission } from './permission.entry';
import {
  FindPermissionHandler,
  GetAllPermissionQueryHandler,
  UserHasPermissionService,
} from './queries';
import { UserRole } from '../user';
import { RolePermission } from '../role';

@Module({
  imports: [MikroOrmModule.forFeature([UserRole, Permission, RolePermission])],
  controllers: [PermissionController],
  providers: [
    PermissionService,
    RemovePermissionCommandHandler,
    CreatePermissionHandler,
    UpdatePermissionHandler,
    GetAllPermissionQueryHandler,
    FindPermissionHandler,
    UserHasPermissionService,
  ],
})
export class PermissionModule {}
