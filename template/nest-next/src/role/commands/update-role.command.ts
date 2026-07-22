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
    return this.em.transactional(async (em) => {
      const role = await this.role.findOne({ id }, { em });
      if (!role) {
        throw new RoleNotFound();
      }
      if (name) {
        role.name = name;
      }
      if (command.permissionIds) {
        await em.nativeDelete(RolePermission, { roleId: id });
        command.permissionIds
          .map((pm) => {
            return em.create(RolePermission, { roleId: id, permissionId: pm });
          })
          .forEach((pm) => em.persist(pm));
      }
      if (command.menuIds) {
        await em.nativeDelete(RoleMenu, { roleId: id });
        command.menuIds
          .map((menuId) => em.create(RoleMenu, { roleId: id, menuId }))
          .forEach((menu) => em.persist(menu));
      }
      em.persist(role);
      await em.flush();
      return role.id;
    });
  }
}
