import { defineConfig } from '@mikro-orm/core';
import { MySqlDriver } from '@mikro-orm/mysql';
import { Permission } from './src/permission';
import config from './configs/config.json';

export default defineConfig({
  entities: [Permission],
  host: config.database.host,
  port: config.database.port,
  driver: MySqlDriver,
  user: config.database.user,
  password: config.database.password,
  dbName: config.database.dbName,
});
