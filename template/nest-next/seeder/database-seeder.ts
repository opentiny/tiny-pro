import type { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { MenuSeeder } from './menu-seeder';
import { PermissionSeeder } from './permission-seeder';
import { RoleSeeder } from './role-seeder';
import { UserSeeder } from './user-seeder';

export class DatabaseSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    await em.transactional(async (em) => {
      await this.call(em, [MenuSeeder, PermissionSeeder, RoleSeeder, UserSeeder]);
    });
  }
}
