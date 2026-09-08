import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GetAllPermissionQuery } from './queries';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import {
  CreatePermission,
  RemovePermissionCommand,
  UpdatePermission,
} from './commands';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { PermissionId } from './permission.entry';

@Injectable()
export class PermissionService {
  constructor(
    private readonly qb: QueryBus,
    private readonly cb: CommandBus,
  ) {}

  create(dto: CreatePermissionDto) {
    return this.cb.execute(new CreatePermission(dto));
  }

  updatePermission(dto: UpdatePermissionDto) {
    return this.cb.execute(new UpdatePermission(dto));
  }

  findAllPermission(page: number, size: number, name?: string) {
    return this.qb.execute(new GetAllPermissionQuery(page, size, name));
  }

  remove(id: PermissionId) {
    return this.cb.execute(new RemovePermissionCommand(id));
  }
}
