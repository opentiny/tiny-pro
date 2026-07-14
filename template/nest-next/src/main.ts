import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { INestApplication, VersioningType } from '@nestjs/common';
import { ConfigureService, SwaggerConfigure } from '@app/configure';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableVersioning({
    type: VersioningType.MEDIA_TYPE,
    key: 'v=',
  });

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
bootstrap();
