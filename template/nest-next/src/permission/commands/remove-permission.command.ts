import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RemovePermissionResponse } from '../dto/remove-permission.dto';
import { EntityRepository } from '@mikro-orm/mysql';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Permission, PermissionId } from '../permission.entry';
import { PermissionNotFound } from '../errors';

export class RemovePermissionCommand extends Command<RemovePermissionResponse> {
  constructor(public readonly id: PermissionId) {
    super();
  }
}

@CommandHandler(RemovePermissionCommand)
export class RemovePermissionCommandHandler implements ICommandHandler<RemovePermissionCommand> {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: EntityRepository<Permission>,
  ) {}
  async execute(
    command: RemovePermissionCommand,
  ): Promise<RemovePermissionResponse> {
    const permission = await this.permissionRepository.findOne({
      id: command.id,
    });
    if (!permission) {
      throw new PermissionNotFound();
    }
    await this.permissionRepository.nativeDelete(permission);
    return new RemovePermissionResponse(
      permission.id,
      permission.desc,
      permission.name,
    );
  }
}
