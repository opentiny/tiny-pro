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
  GetAllPermissionQueryHandler,
  GetPermissionByIdQuery,
  GetPermissionsByIdQuery,
} from './queries';

@Module({
  imports: [MikroOrmModule.forFeature([Permission])],
  controllers: [PermissionController],
  providers: [
    PermissionService,
    RemovePermissionCommandHandler,
    CreatePermissionHandler,
    UpdatePermissionHandler,
    GetAllPermissionQueryHandler,
    GetPermissionByIdQuery,
    GetPermissionsByIdQuery,
  ],
})
export class PermissionModule {}
