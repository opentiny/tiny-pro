import { DatabaseConfig } from './database';
import { FeatureConfig } from './feature';

export type Configure = {
  database: DatabaseConfig;
  feature: FeatureConfig
};