import { Module } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { PermissionController } from './permission.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from '@app/models';
import { PermissionInit } from './permission.initalizer';

@Module({
  controllers: [PermissionController],
  providers: [PermissionService, PermissionInit],
  imports: [TypeOrmModule.forFeature([Permission])],
  exports: [PermissionService, PermissionInit],
})
export class PermissionModule {}
