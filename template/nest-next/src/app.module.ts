import { Module } from '@nestjs/common';
import { ConfigureModule, ConfigureService } from '@app/configure';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { GlobalExceptionFilter } from '@app/shared';
import { HeaderResolver, I18nModule } from 'nestjs-i18n';
import { join } from 'path';
import { PermissionModule } from './permission/permission.module';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { MySqlDriver } from '@mikro-orm/mysql';
import { Permission } from './permission';
import { CqrsModule } from '@nestjs/cqrs';
import { MenuModule } from './menu/menu.module';
import { Menu } from './menu/menu.entity';
import { RejectRequestGuard } from '@app/shared/guards/reject.guard';
import { RoleModule } from './role/role.module';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { Role, RoleMenu, RolePermission } from './role';

@Module({
  imports: [
    ConfigureModule,
    CqrsModule.forRoot({
      rethrowUnhandled: true,
    }),
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
    PermissionModule,
    MikroOrmModule.forRootAsync({
      imports: [ConfigureModule],
      inject: [ConfigureService],
      useFactory: (configService: ConfigureService) => ({
        entities: [Menu, Permission, Role, RoleMenu, RolePermission],
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        driver: MySqlDriver,
        user: configService.get('database.user'),
        password: configService.get('database.password'),
        dbName: configService.get('database.dbName'),
      }),
    }),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unnecessary-type-assertion
    RedisModule.forRootAsync({
      imports: [ConfigureModule],
      inject: [ConfigureService],
      useFactory: (configService: ConfigureService) => {
        return {
          config: {
            host: configService.get('redis.host'),
            user: configService.get('redis.user'),
            password: configService.get('redis.password'),
            db: configService.get('redis.db'),
          },
        };
      },
    } as any),
    MenuModule,
    RoleModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: RejectRequestGuard
    }
  ],
})
export class AppModule {}
