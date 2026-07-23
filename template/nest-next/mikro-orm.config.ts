import { defineConfig } from '@mikro-orm/core';
import { MySqlDriver } from '@mikro-orm/mysql';
import { Permission } from './src/permission';
import { Menu } from './src/menu';
import { SeedManager } from '@mikro-orm/seeder';
import config from './configs/config.json';
import { Role, RoleMenu, RolePermission } from './src/role';
import { User, UserRole } from './src/user';
import { I18n, Lang } from './src/i18';
import { Migrator } from '@mikro-orm/migrations';
import { Application } from './src/application';

export default defineConfig({
  entities: [
    Permission,
    Menu,
    Role,
    RolePermission,
    RoleMenu,
    User,
    UserRole,
    Lang,
    I18n,
    Application,
  ],
  host: process.env.DATABASE_HOST || config.database.host,
  port: Number(process.env.DATABASE_PORT) || config.database.port,
  driver: MySqlDriver,
  user: process.env.DATABASE_USER || config.database.user,
  password: process.env.DATABASE_PASSWORD || config.database.password,
  dbName: process.env.DATABASE_DB_NAME || config.database.dbName,
  extensions: [SeedManager, Migrator],
  seeder: {
    path: './seeder',
  },
  migrations: {
    path: './migrations',
  },
});
