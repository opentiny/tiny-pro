import { AuthConfigure } from './auth';
import { DatabaseConfig } from './database';
import { RedisConfigure } from './redis';
import { SwaggerConfigure } from './swagger';

export type Configure = {
  database: DatabaseConfig;
  redis: RedisConfigure;
  swagger?: SwaggerConfigure;
  auth: AuthConfigure;
};
