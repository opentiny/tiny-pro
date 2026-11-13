import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { I18nValidationExceptionFilter, I18nValidationPipe } from 'nestjs-i18n';
import { DataSource } from 'typeorm';
import { generateMigration } from './generateMigration';

import * as winston from 'winston';
import { createLogger } from 'winston';
import { createServer } from 'node:net';
import { utilities, WinstonModule } from 'nest-winston';
import 'winston-daily-rotate-file'; // 用于存储日志到文件
import { INestApplication, RequestMethod } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { Configure } from './config-schema';
import { HttpResponseInterceptor } from './public/http-response.interceptor';
import { HttpResponseExceptionFilter } from './public/http-response.exception-filter';

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

  const cfg = app.get<ConfigService<Configure>>(ConfigService);

  app.setGlobalPrefix(process.env.GLOBAL_PREFIX || '/api', {
    exclude: [{ path: 'healthCheck', method: RequestMethod.GET }]
  });

  if (process.env.GEN_MIGRATION) {
    const connection = app.get(DataSource);

    await generateMigration(connection, process.env.GEN_MIGRATION);
    return;
  }
  app.useGlobalPipes(new I18nValidationPipe());
  app.useGlobalInterceptors(new HttpResponseInterceptor());
  app.useGlobalFilters(
    new I18nValidationExceptionFilter({
      errorFormatter: (errors) => {
        const reason: string[] = [];
        for (const err of errors) {
          reason.push(...Object.values(err.constraints));
        }
        return reason;
      },
    }),
    new HttpResponseExceptionFilter()
  );
  if (cfg.get('ENABLE_SWAGGER')) {
    prepareSwagger(cfg, app);
  }
  // dev-watch 模式（scripts/dev-watch.mjs）下，重建重启时旧进程可能尚未
  // 释放端口，先等待端口可用再 listen，避免 EADDRINUSE 报错
  if (process.env.TINY_PRO_DEV_WATCH === 'true') {
    await waitForPortFree(3000);
  }
  await app.listen(3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}

function isPortFree(port: number) {
  return new Promise<boolean>((resolve) => {
    const tester = createServer();
    tester.once('error', () => resolve(false));
    tester.once('listening', () => {
      tester.close(() => resolve(true));
    });
    tester.listen(port);
  });
}

async function waitForPortFree(port: number, timeoutMs = 60000) {
  const start = Date.now();
  let logged = false;
  while (!(await isPortFree(port))) {
    if (!logged) {
      console.log(`Port ${port} is occupied, waiting for the previous instance to exit...`);
      logged = true;
    }
    if (Date.now() - start > timeoutMs) {
      throw new Error(
        `Port ${port} is still occupied after ${timeoutMs / 1000}s: another nestJS instance is likely running. ` +
        `Kill it (e.g. Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -match 'nestJs' } | Stop-Process -Force), ` +
        `then save any source file to retry.`
      );
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
}
bootstrap();


function prepareSwagger(cfg: ConfigService<Configure>,app: INestApplication<any>){
  const swaggerConfig = new DocumentBuilder()
    .setTitle(cfg.get('SWAGGER_TITLE'))
    .setDescription(cfg.get('SWAGGER_DESC'))
    .setVersion(cfg.get('SWAGGER_VERSION'))
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, documentFactory)
}
