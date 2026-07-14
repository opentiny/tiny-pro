import { defineConfig } from '@mikro-orm/core';
import { MySqlDriver } from '@mikro-orm/mysql';
import { Permission } from './src/permission';
import { Menu } from './src/menu';
import { SeedManager } from '@mikro-orm/seeder';
import config from './configs/config.json';
import { Role, RoleMenu, RolePermission } from './src/role';

export default defineConfig({
  entities: [Permission, Menu, Role, RolePermission, RoleMenu],
  host: config.database.host,
  port: config.database.port,
  driver: MySqlDriver,
  user: config.database.user,
  password: config.database.password,
  dbName: config.database.dbName,
  extensions: [SeedManager],
  seeder: {
    path: './seeder',
  },
});
