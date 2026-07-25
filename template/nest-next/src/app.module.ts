import { Module } from '@nestjs/common';
import { ConfigureModule, ConfigureService } from '@app/configure';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { GlobalExceptionFilter } from '@app/shared';
import { HeaderResolver, I18nModule } from 'nestjs-i18n';
import { join } from 'path';
import { PermissionModule } from './permission/permission.module';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { MySqlDriver } from '@mikro-orm/mysql';
import { Permission, PermissionGuard } from './permission';
import { CqrsModule } from '@nestjs/cqrs';
import { MenuModule } from './menu/menu.module';
import { Menu } from './menu/menu.entity';
import { RoleModule } from './role/role.module';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { Role, RoleMenu, RolePermission } from './role';
import { UserModule } from './user/user.module';
import { User, UserRole } from './user';
import { AuthModule } from './auth/auth.module';
import { AuthGuard } from './auth';
import { JwtModule } from '@nestjs/jwt';
import { readFileSync } from 'fs';
import { randomBytes } from 'crypto';
import { I18Module } from './i18/i18.module';
import { I18n, Lang } from './i18';
import { RejectRequestGuard } from '@app/shared';
import { HealthCheckController } from './health-check.controller';
import { MockModule } from './mock/mock.module';
import { ApplicationModule } from './application/application.module';
import { Application } from './application';

@Module({
  imports: [
    ConfigureModule,
    JwtModule.registerAsync({
      inject: [ConfigureService],
      imports: [ConfigureModule],
      useFactory: (configService: ConfigureService) => {
        const jwtConfig = configService.get('auth.jwt');
        if (jwtConfig.mode === 'secret') {
          const secret = jwtConfig.secret
            ? jwtConfig.secret
            : randomBytes(128).toString('hex');
          if (!jwtConfig.secret) {
            console.log('JWT secret is not set, using random secret');
            console.log('JWT secret: ' + secret);
          }
          return {
            global: true,
            secret,
          };
        }
        return {
          global: true,
          publicKeyPath: readFileSync(jwtConfig.publicKeyPath).toString(),
          privateKeyPath: readFileSync(jwtConfig.privateKeyPath).toString(),
        };
      },
      global: true,
    }),
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
        entities: [
          Menu,
          Permission,
          Role,
          RoleMenu,
          RolePermission,
          User,
          UserRole,
          Lang,
          I18n,
          Application,
        ],
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
    UserModule,
    AuthModule,
    I18Module,
    MockModule,
    ApplicationModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RejectRequestGuard,
    },
  ],
  controllers: [HealthCheckController],
})
export class AppModule {}
