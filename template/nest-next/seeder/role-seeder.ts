import { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { Permission } from '../src/permission';
import { Menu } from 'src/menu';
import { Role, RoleMenu, RolePermission } from 'src/role';
import { log } from './utils/log';

export class RoleSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const admin = await em.findOne(Role, { name: 'admin' });
    if (admin) {
      log.error('Admin Role Already Exist');
      return;
    }

    const permission = await em.findOne(Permission, { name: '*' });
    if (!permission) {
      log.error('Super Permission Not Exist');
      return;
    }
    const menus = await em.find(Menu, {});
    if (!menus.length) {
      log.error('Menu Record Not Exist');
      return;
    }
    const role = em.create(Role, {
      name: 'admin',
    });
    const rolePermission = em.create(RolePermission, {
      permissionId: permission.id,
      roleId: role.id,
    });
    em.persist(role);
    em.persist(rolePermission);
    for (const menu of menus) {
      const roleMenu = em.create(RoleMenu, {
        roleId: role.id,
        menuId: menu.id,
      });
      em.persist(roleMenu);
    }
    await em.flush();
  }
}
