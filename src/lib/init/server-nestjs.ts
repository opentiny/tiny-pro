import * as path from 'path';
import { parse, stringify } from 'yaml';
import { copySync } from 'fs-extra';
import { readFileSync, writeFileSync } from 'fs';
import { ServerFrameworks, ProjectInfo } from '../interfaces';
import utils from '../utils';
import { objToEnv } from './env-config';

interface NestJsConfig {
  DATABASE_HOST: string | false;
  DATABASE_PORT: number | false;
  DATABASE_USERNAME: string | false;
  DATABASE_PASSWORD: string | false;
  DATABASE_NAME: string | false;
  DATABASE_SYNCHRONIZE: boolean;
  DATABASE_AUTOLOADENTITIES: boolean;
  AUTH_SECRET: string;
  REDIS_SECONDS: number;
  REDIS_HOST: string;
  REDIS_PORT: number;
  EXPIRES_IN: string;
  PAGINATION_PAGE: number;
  PAGINATION_LIMIT: number;
}

const buildNestJsConfig = (answers: ProjectInfo): NestJsConfig => ({
  DATABASE_HOST: answers.dialect && (answers.host ?? 'localhost'),
  DATABASE_PORT: answers.dialect && Number(answers.port ?? 3306),
  DATABASE_USERNAME: answers.dialect && (answers.username ?? 'root'),
  DATABASE_PASSWORD: answers.dialect && (answers.password ?? 'root'),
  DATABASE_NAME: answers.dialect && answers.database,
  DATABASE_SYNCHRONIZE: false,
  DATABASE_AUTOLOADENTITIES: true,
  AUTH_SECRET: 'secret',
  REDIS_SECONDS: 7200,
  REDIS_HOST: answers.redisHost ?? 'localhost',
  REDIS_PORT: Number(answers.redisPort ?? 6379),
  EXPIRES_IN: '2h',
  PAGINATION_PAGE: 1,
  PAGINATION_LIMIT: 10,
});

const overwriteDockerComposeEnvironment = (config: NestJsConfig) => ({
  MYSQL_ROOT_PASSWORD: config.DATABASE_PASSWORD,
  MYSQL_DATABASE: config.DATABASE_NAME,
  MYSQL_USER:
    config.DATABASE_USERNAME === 'root' ? undefined : config.DATABASE_NAME,
  MYSQL_PASSWORD:
    config.DATABASE_USERNAME === 'root'
      ? undefined
      : config.DATABASE_PASSWORD,
});

export const createNestJsServer = (answers: ProjectInfo) => {
  const { name } = answers;
  const serverFrom = utils.getTemplatePath(ServerFrameworks.NestJs);
  const serverTo = utils.getDistPath(`${name}/${ServerFrameworks.NestJs}`);

  const config = buildNestJsConfig(answers);
  const envStr = objToEnv(config);
  const dockerComposeConfig = overwriteDockerComposeEnvironment(config);

  copySync(serverFrom, serverTo);
  writeFileSync(path.join(serverTo, '.env'), envStr);

  const dockerComposeYaml = readFileSync(
    path.join(serverTo, 'docker-compose.yml')
  ).toString();
  const yaml = parse(dockerComposeYaml);
  yaml.services.mysql.environment = dockerComposeConfig;
  writeFileSync(path.join(serverTo, 'docker-compose.yml'), stringify(yaml));
};
