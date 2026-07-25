import * as winston from 'winston';
import 'winston-daily-rotate-file';
import { utilities, WinstonModule } from 'nest-winston';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  INestApplication,
  RequestMethod,
  VersioningType,
} from '@nestjs/common';
import { ConfigureService, SwaggerConfigure } from '@app/configure';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { I18nValidationPipe } from 'nestjs-i18n';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      instance: setupLogger(),
    }),
  });
  app.setGlobalPrefix('/api', {
    exclude: [{ path: 'healthCheck', method: RequestMethod.GET }],
  });
  app.enableVersioning({
    type: VersioningType.MEDIA_TYPE,
    key: 'v=',
  });

  app.useGlobalPipes(new I18nValidationPipe({ transform: true }));

  const configureService = app.get(ConfigureService);

  const swaggerConfigure = configureService.get('swagger');

  setupSwagger(app, swaggerConfigure);

  await app.listen(process.env.PORT ?? 3000);
}

function setupSwagger(app: INestApplication, configure: SwaggerConfigure = {}) {
  const { title, version, description } = {
    title: 'TinyPro',
    version: '2.0',
    description: '',
    ...configure,
  };
  const config = new DocumentBuilder()
    .setTitle(title)
    .setVersion(version)
    .setDescription(description)
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
}

function setupLogger() {
  return winston.createLogger({
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
}

bootstrap().catch(console.error);
