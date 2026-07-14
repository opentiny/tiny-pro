import type { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { Permission } from '../src/permission';

const permissionsMap = {
  user: [
    'add',
    'remove',
    'update',
    'query',
    'password::force-update',
    'batch-remove',
  ],
  permission: ['add', 'remove', 'update', 'get'],
  role: ['add', 'remove', 'update', 'query'],
  menu: ['add', 'remove', 'update', 'query'],
  i18n: ['add', 'remove', 'update', 'query', 'batch-remove'],
  lang: ['add', 'remove', 'update', 'query'],
} as const;

const modules = Object.keys(permissionsMap) as (keyof typeof permissionsMap)[];
const permissions = modules.flatMap((module) => {
  const actions = permissionsMap[module];
  return actions.map((action) => {
    return {
      name: `${module}::${action}`,
      desc: '',
    };
  });
});
permissions.unshift({ name: '*', desc: '' });

export class PermissionSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    for (const permission of permissions) {
      const perm = await em.findOne(Permission, { name: permission.name });
      if (!perm) {
        em.persist(em.create(Permission, permission));
      }
    }
    await em.flush();
  }
}
