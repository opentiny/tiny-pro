import { Module } from '@nestjs/common';
import { ConfigureModule, ConfigureService } from '@app/configure';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { MySqlDriver } from '@mikro-orm/mysql';

@Module({
  imports: [
    ConfigureModule,
    MikroOrmModule.forRootAsync({
      imports: [ConfigureModule],
      inject: [ConfigureService],
      useFactory: (configService: ConfigureService) => ({
        entities: [],
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        driver: MySqlDriver,
        user: configService.get('database.user'),
        password: configService.get('database.password'),
        dbName: configService.get('database.dbName'),
      }),
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
