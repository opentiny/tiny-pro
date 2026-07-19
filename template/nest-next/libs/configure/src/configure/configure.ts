import { AuthConfigure } from './auth';
import { DatabaseConfig } from './database';
import { FeatureConfigure } from './feature';
import { RedisConfigure } from './redis';
import { SwaggerConfigure } from './swagger';

export type Configure = {
  database: DatabaseConfig;
  redis: RedisConfigure;
  feature: FeatureConfigure;
  swagger?: SwaggerConfigure;
  auth: AuthConfigure;
};
