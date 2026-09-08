import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  UpdatePermissionDto,
  UpdatePermissionResponse,
} from '../dto/update-permission.dto';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Permission } from '../permission.entry';
import { EntityRepository } from '@mikro-orm/core';
import { PermissionNotFound } from '../errors';

export class UpdatePermission extends Command<UpdatePermissionResponse> {
  constructor(public readonly dto: UpdatePermissionDto) {
    super();
  }
}

@CommandHandler(UpdatePermission)
export class UpdatePermissionHandler implements ICommandHandler<UpdatePermission> {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: EntityRepository<Permission>,
  ) {}
  async execute(command: UpdatePermission): Promise<UpdatePermissionResponse> {
    const permission = await this.permissionRepository.findOne({
      id: command.dto.id,
    });
    if (!permission) {
      throw new PermissionNotFound();
    }
    if (command.dto.name) {
      permission.name = command.dto.name;
    }
    if (command.dto.desc) {
      permission.desc = command.dto.desc;
    }
    await this.permissionRepository.upsert(permission);
    return new UpdatePermissionResponse(permission.id);
  }
}
