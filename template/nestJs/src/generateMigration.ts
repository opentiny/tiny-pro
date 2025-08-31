import { Logger } from '@nestjs/common';
import { Connection, DataSource } from 'typeorm';
import * as prettier from 'prettier';
import { Query } from 'typeorm/driver/Query';
import * as fs from 'fs/promises';

const getTemplate = (
  name: string,
  timestamp: number,
  upSqls: string[],
  downSqls: string[],
): string => {
  const migrationName = `${name}${timestamp}`;

  return `
    const {MigrationInterface, QueryRunner} = require('typeorm');
    class ${migrationName} {
      name = '${migrationName}'
      async up(queryRunner) {
        ${upSqls.join('\n')}
      }
      async down(queryRunner) {
        ${downSqls.join('\n')}
      }
    }

    module.exports = ${migrationName};
  `;
};

const queryParams = (parameters: any[] | undefined): string => {
  if (!parameters || !parameters.length) {
    return '';
  }

  return `, ${JSON.stringify(parameters)}`;
};

export const generateMigration = async (
  connection: DataSource,
  name: string,
) => {
  const queries = await connection.driver.createSchemaBuilder().log();

  if (queries.upQueries.length === 0) {
    Logger.warn('Database is up-to-date. ');
    return;
  }

  const mapSqlToJs = (query: Query) => {
    return (
      'await queryRunner.query(`' +
      query.query.replace(new RegExp('`', 'g'), '\\`') +
      '`' +
      queryParams(query.parameters) +
      ');'
    );
  };

  const upSqls: string[] = queries.upQueries.map(mapSqlToJs),
    downSqls: string[] = queries.downQueries.map(mapSqlToJs);

  const code = getTemplate(name, new Date().getTime(), upSqls, downSqls);

  const config = await prettier.resolveConfig(process.cwd());

  const formatted = prettier.format(code, {
    ...config,
    parser: 'babel-ts',
  });

  try {
    await fs.readdir('migrations');
  } catch (_) {
    await fs.mkdir('migrations', {
      recursive: true,
    });
  }
  const fileName = `migrations/${Date.now()}-${name}.js`;
  await fs.writeFile(fileName, formatted);

  Logger.log(`Success! Migration file created at ${fileName}`);
};
