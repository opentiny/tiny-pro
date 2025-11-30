import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { I18nValidationExceptionFilter, I18nValidationPipe } from 'nestjs-i18n';
import { DataSource } from 'typeorm';
import { generateMigration } from './generateMigration';

import * as winston from 'winston';
import { createLogger } from 'winston';
import { utilities, WinstonModule } from 'nest-winston';
import 'winston-daily-rotate-file'; // 用于存储日志到文件
import { RequestMethod } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

dotenv.config({ path: '.env' });

async function bootstrap() {
  // 日志配置
  const instance = createLogger({
    // 日志选项
    transports: [
      new winston.transports.Console({
        level: 'info',
        // 字符串拼接
        format: winston.format.combine(
          winston.format.timestamp(),
          utilities.format.nestLike(),
        ),
      }),
      // warn、error日志存储到/logs/application-日期.log文件中
      new winston.transports.DailyRotateFile({
        level: 'warn',
        dirname: 'logs',
        filename: 'application-%DATE%.log',
        datePattern: 'YYYY-MM-DD-HH',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.simple(),
        ),
      }),
      // info日志存储到/logs/info-日期.log文件中
      new winston.transports.DailyRotateFile({
        level: 'info',
        dirname: 'logs',
        filename: 'info-%DATE%.log',
        datePattern: 'YYYY-MM-DD-HH',
        zippedArchive: true,
        // 文件大小
        maxSize: '20m',
        // 最多14 天
        maxFiles: '14d',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.simple(),
        ),
      }),
    ],
  });

  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      instance,
    }),
  });

  app.setGlobalPrefix(process.env.GLOBAL_PREFIX || '/api', {
    exclude: [{ path: 'healthCheck', method: RequestMethod.GET }]
  });

  if (process.env.GEN_MIGRATION) {
    const connection = app.get(DataSource);

    await generateMigration(connection, process.env.GEN_MIGRATION);
    return;
  }
  app.useGlobalPipes(new I18nValidationPipe());
  app.useGlobalFilters(
    new I18nValidationExceptionFilter({
      errorFormatter: (errors) => {
        const reason: string[] = [];
        for (const err of errors) {
          reason.push(...Object.values(err.constraints));
        }
        return reason;
      },
    })
  );
    const config = new DocumentBuilder()
    .setTitle(process.env.SWAGGER_TITLE || 'Tiny Pro')
    .setDescription(process.env.SWAGGER_DESC || '开箱即用的中后台模板')
    .setVersion(process.env.SWAGGER_VERSION || '1.0.0')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);
  await app.listen(3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
