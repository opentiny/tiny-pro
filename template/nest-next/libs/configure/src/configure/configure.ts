import { DatabaseConfig } from './database';
import { FeatureConfig } from './feature';
import { RedisConfigure } from './redis';
import { SwaggerConfigure } from './swagger';

export type Configure = {
  database: DatabaseConfig;
  feature: FeatureConfig
  redis: RedisConfigure;
  swagger?: SwaggerConfigure;
  feature: FeatureConfig
};
