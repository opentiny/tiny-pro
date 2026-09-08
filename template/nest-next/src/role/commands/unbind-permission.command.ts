import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PermissionId } from '../../permission';
import { EntityRepository } from '@mikro-orm/mysql';
import { RolePermission } from '../role.entity';
import { InjectRepository } from '@mikro-orm/nestjs';

export class UnbindPermission extends Command<void> {
  constructor(public permissionId: PermissionId) {
    super();
  }
}

@CommandHandler(UnbindPermission)
export class UnbindPermissionHandler implements ICommandHandler<UnbindPermission> {
  constructor(
    @InjectRepository(RolePermission)
    private readonly rolePermissionRepo: EntityRepository<RolePermission>,
  ) {}
  async execute(command: UnbindPermission): Promise<void> {
    const { permissionId } = command;
    await this.rolePermissionRepo.nativeDelete({
      permissionId,
    });
  }
}
