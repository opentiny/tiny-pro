import type { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { Role } from '../src/role';
import { log } from './utils/log';
import { User, UserRole } from '../src/user';

export class UserSeeder extends Seeder {

  async run(em: EntityManager): Promise<void> {
    const adminRole = await em.findOne(Role, { name: 'admin' });
    if (!adminRole) {
      log.error('Admin role not found. Please ensure that the RoleSeeder has been run before the UserSeeder.');
      return;
    }
    const user = em.create(User, {
      name: 'admin',
      email: 'admin@no-reply.com',
      password: 'admin'
    });
    user.role.add(new UserRole(user, adminRole.id));
    em.persist(user);
    await em.flush();
  }

}
