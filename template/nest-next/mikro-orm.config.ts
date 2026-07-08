import { defineConfig } from '@mikro-orm/core';
import { MySqlDriver } from '@mikro-orm/mysql';

export default defineConfig({
  entities: [],
  host: process.env.HOST_NAME,
  port: 3306,
  driver: MySqlDriver,
  user: process.env.USER_NAME,
  password: process.env.PASSWORD,
  dbName: process.env.DB_NAME,
});
