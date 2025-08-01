import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { I18nValidationExceptionFilter, I18nValidationPipe } from 'nestjs-i18n';
import { DataSource } from 'typeorm';
import { generateMigration } from './generateMigration';

dotenv.config({ path: '.env' });

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
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
  await app.listen(3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap()
