import { Module } from '@nestjs/common';
import { ConfigureModule } from '@app/configure';
import { APP_FILTER } from '@nestjs/core';
import { GlobalExceptionFilter } from '@app/shared';
import { HeaderResolver, I18nModule } from 'nestjs-i18n';
import { join } from 'path';



@Module({
  imports: [
    ConfigureModule,
    I18nModule.forRoot({
      fallbackLanguage: 'enUS',
      loaderOptions: {
        path: join(__dirname, '/i18n/'),
        watch: true,
      },
      resolvers: [new HeaderResolver(['x-lang'])],
      typesOutputPath: join(
        __dirname,
        '../libs/shared/src/.generate/i18n.generated.ts',
      ),
    }),
    // MikroOrmModule.forRootAsync({
    //   imports: [ConfigureModule],
    //   inject: [ConfigureService],
    //   useFactory: (configService: ConfigureService) => ({
    //     entities: [],
    //     host: configService.get('database.host'),
    //     port: configService.get('database.port'),
    //     driver: MySqlDriver,
    //     user: configService.get('database.user'),
    //     password: configService.get('database.password'),
    //     dbName: configService.get('database.dbName'),
    //   }),
    // }),
  ],
  providers: [
    {
      provide: APP_FILTER,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      useClass: GlobalExceptionFilter,
    }
  ],
})
export class AppModule {}
