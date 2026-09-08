import { InjectRepository } from '@mikro-orm/nestjs';
import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  CreatePermissionDto,
  CreatePermissionResponse,
} from '../dto/create-permission.dto';
import { Permission } from '../permission.entry';
import { EntityRepository } from '@mikro-orm/core';

export class CreatePermission extends Command<CreatePermissionResponse> {
  constructor(public readonly dto: CreatePermissionDto) {
    super();
  }
}

@CommandHandler(CreatePermission)
export class CreatePermissionHandler implements ICommandHandler<CreatePermission> {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: EntityRepository<Permission>,
  ) {}
  async execute(command: CreatePermission): Promise<CreatePermissionResponse> {
    const permission = this.permissionRepository.create({
      name: command.dto.name,
      desc: command.dto.desc,
    });
    await this.permissionRepository.upsert(permission);
    return new CreatePermissionResponse(
      permission.id,
      permission.desc,
      permission.name,
    );
  }
}
