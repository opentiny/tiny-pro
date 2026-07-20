import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Role, RoleId, RoleMenu, RolePermission } from '../role.entity';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/mysql';
import { RoleNotFound } from '../errors';
import { EntityManager } from '@mikro-orm/core';
import type { PermissionId } from '../../permission';
import { MenuId } from 'src/menu';

export class UpdateRoleCommand extends Command<RoleId> {
  constructor(
    public readonly id: RoleId,
    public readonly name?: string,
    public readonly permissionIds?: PermissionId[],
    public readonly menuIds?: MenuId[],
  ) {
    super();
  }
}

@CommandHandler(UpdateRoleCommand)
export class UpdateRoleHandler implements ICommandHandler<UpdateRoleCommand> {
  constructor(
    @InjectRepository(Role)
    private readonly role: EntityRepository<Role>,
    @InjectRepository(RolePermission)
    private readonly rolePermission: EntityRepository<RolePermission>,
    @InjectRepository(RoleMenu)
    private readonly roleMenu: EntityRepository<RoleMenu>,
    private readonly em: EntityManager,
  ) {}
  async execute(command: UpdateRoleCommand): Promise<RoleId> {
    const { id, name } = command;
    const role = await this.role.findOne({ id });
    if (!role) {
      throw new RoleNotFound();
    }
    if (name) {
      role.name = name;
    }
    if (command.permissionIds) {
      await this.rolePermission.nativeDelete(
        {
          roleId: id,
        },
        { logging: { debugMode: ['info'], enabled: true } },
      );
      command.permissionIds
        .map((pm) => {
          return this.rolePermission.create({ roleId: id, permissionId: pm });
        })
        .map((pm) => this.em.persist(pm));
    }
    if (command.menuIds) {
      await this.roleMenu.nativeDelete(
        { roleId: id },
        { logging: { debugMode: ['info'], enabled: true } },
      );
      command.menuIds
        .map((menuId) => this.roleMenu.create({ roleId: id, menuId }))
        .forEach((menu) => this.em.persist(menu));
    }
    this.em.persist(role);
    await this.em.flush();
    return role.id;
  }
}
