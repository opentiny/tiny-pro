import * as path from 'path';
import { copySync } from 'fs-extra';
import { logs } from '@opentiny/cli-devkit';
import { createEditor } from 'properties-parser';
import { existsSync } from 'fs';
import { ServerFrameworks, ProjectInfo } from '../interfaces';
import utils from '../utils';

const log = logs('tiny-toolkit-pro');

const SPRINGBOOT_PROPERTIES_RELATIVE =
  'src/main/resources/application.properties';

interface SpringBootConfig {
  DB_HOST: string;
  DB_PORT: number;
  DB_USERNAME: string;
  DB_PASSWORD: string;
  DB_NAME: string;
  DB_SYNCHRONIZE: boolean;
  DB_AUTOLOADENTITIES: boolean;
  AUTH_SECRET: string;
  REDIS_SECONDS: number;
  REDIS_HOST: string;
  REDIS_PORT: number;
  EXPIRES_IN: string;
  PAGINATION_PAGE: number;
  PAGINATION_LIMIT: number;
  SERVER_PORT: number;
}

const buildSpringBootConfig = (answers: ProjectInfo): SpringBootConfig => ({
  DB_HOST: answers.host ?? 'localhost',
  DB_PORT: Number(answers.port ?? 3306),
  DB_USERNAME: answers.username ?? 'root',
  DB_PASSWORD: answers.password ?? 'root',
  DB_NAME: answers.database ?? 'mydb',
  DB_SYNCHRONIZE: false,
  DB_AUTOLOADENTITIES: true,
  AUTH_SECRET: 'secret',
  REDIS_SECONDS: 7200,
  REDIS_HOST: answers.redisHost ?? 'localhost',
  REDIS_PORT: Number(answers.redisPort ?? 6379),
  EXPIRES_IN: '2h',
  PAGINATION_PAGE: 1,
  PAGINATION_LIMIT: 10,
  SERVER_PORT: 3000,
});

const buildJdbcUrl = (config: SpringBootConfig) =>
  `jdbc:mysql://${config.DB_HOST}:${config.DB_PORT}/${config.DB_NAME}?allowMultiQueries=true&serverTimezone=GMT%2B8&useUnicode=true&characterEncoding=utf8&autoReconnect=true&allowMultiQueries=true&allowPublicKeyRetrieval=true&useSSL=false`;

const applyPropertiesConfig = (
  editor: ReturnType<typeof createEditor>,
  config: SpringBootConfig
) => {
  editor.set('server.port', config.SERVER_PORT.toString());

  editor.set('spring.datasource.url', buildJdbcUrl(config));
  editor.set('spring.datasource.username', config.DB_USERNAME);
  editor.set('spring.datasource.password', config.DB_PASSWORD);
  editor.set('spring.datasource.driver-class-name', 'com.mysql.cj.jdbc.Driver');

  editor.set('spring.datasource.hikari.pool-name', 'HikariCPDatasource');
  editor.set('spring.datasource.hikari.minimum-idle', '5');
  editor.set('spring.datasource.hikari.idle-timeout', '180000');
  editor.set('spring.datasource.hikari.maximum-pool-size', '10');
  editor.set('spring.datasource.hikari.auto-commit', 'true');
  editor.set('spring.datasource.hikari.max-lifetime', '180000');
  editor.set('spring.datasource.hikari.connection-timeout', '30000');

  editor.set('mybatis-plus.mapper-locations', 'classpath:mappers/*.xml');
  editor.set('mybatis-plus.type-aliases-package', 'com.TinyPro.entity.po');
  editor.set('mybatis-plus.configuration.map-underscore-to-camel-case', 'true');
  editor.set(
    'mybatis-plus.configuration.default-enum-type-handler',
    'org.apache.ibatis.type.EnumOrdinalTypeHandler'
  );

  editor.set('spring.jpa.hibernate.ddl-auto', 'update');
  editor.set('spring.jpa.database-platform', 'org.hibernate.dialect.MySQL8Dialect');
  editor.set(
    'spring.jpa.properties.hibernate.dialect',
    'org.hibernate.dialect.MySQL8Dialect'
  );
  editor.set('spring.jpa.properties.hibernate.dialect.storage_engine', 'innodb');
  editor.set(
    'spring.jpa.properties.hibernate.globally_quoted_identifiers',
    'true'
  );
  editor.set(
    'spring.jpa.hibernate.naming.physical-strategy',
    'org.hibernate.boot.model.naming.PhysicalNamingStrategyStandardImpl'
  );

  editor.set('jwt.secret', '0Zi4SA==');

  editor.set('spring.data.redis.host', config.REDIS_HOST);
  editor.set('spring.data.redis.port', config.REDIS_PORT.toString());
};

export const createSpringBootServer = (answers: ProjectInfo) => {
  const { name } = answers;
  const serverFrom = utils.getTemplatePath(ServerFrameworks.SpringBoot);
  const serverTo = utils.getDistPath(`${name}/${ServerFrameworks.SpringBoot}`);

  copySync(serverFrom, serverTo);

  const config = buildSpringBootConfig(answers);
  const propertiesFilePath = path.join(serverTo, SPRINGBOOT_PROPERTIES_RELATIVE);

  if (!existsSync(propertiesFilePath)) {
    log.error(`❌ 未找到 Spring Boot 配置文件：${propertiesFilePath}`);
    return;
  }

  const editor = createEditor(propertiesFilePath);
  applyPropertiesConfig(editor, config);
  editor.save(propertiesFilePath);

  log.success(`✅ Spring Boot 配置文件已更新：${propertiesFilePath}`);
};
