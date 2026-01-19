import {
  HttpException,
  Logger,
  Module,
  OnModuleInit,
} from '@nestjs/common';
import { UserModule } from './user/user.module';
import { DbModule } from '@app/db';
import { PermissionModule } from './permission/permission.module';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth/auth.guard';
import { PermissionGuard } from './permission/permission.guard';
import { RoleModule } from './role/role.module';
import { join } from 'path';
import { readFileSync } from 'fs';
import { UserService } from './user/user.service';
import { RoleService } from './role/role.service';
import { PermissionService } from './permission/permission.service';
import { MenuService } from './menu/menu.service';
import { MenuModule } from './menu/menu.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { I18Module } from './i18/i18.module';
import { I18LangService } from './i18/lang.service';
import { I18Service } from './i18/i18.service';
import {
  HeaderResolver,
  I18nModule,
} from 'nestjs-i18n';
import { MockModule } from './mock/mock.module';
import { RejectRequestGuard } from './public/reject.guard';
import { HealthCheckController } from './health-check.controller';
import { ApplicationModule } from './application/application.module';
import { ApplicationService } from './application/application.service';
import { CONFIG_SCHEMA, Configure } from './config-schema';
import { InstallLock } from './install-lock';
import { RedisService } from '../libs/redis/redis.service';
import Redis from 'ioredis';
import { RedisModule } from '../libs/redis/redis.module';
import { LockerModule } from '@app/locker';
import { MenuInitializer } from './menu/menu.initializer';
import { RoleInit } from './role/role.initializer';
import { PermissionInit } from './permission/permission.initalizer';
import { UserInit } from './user/user.initalizer';
import { ApplicationInit } from './application/application.init';

const INSTALL_FLAG = 'FLAG:INSTALL';
const MAX_RETRY = 20;

@Module({
  imports: [
    DbModule,
    UserModule,
    PermissionModule,
    AuthModule,
    RoleModule,
    MenuModule,
    ApplicationModule,
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
      validationSchema: CONFIG_SCHEMA
    }),
    I18Module,
    I18nModule.forRoot({
      fallbackLanguage: 'enUS',
      loaderOptions: {
        path: join(__dirname, '/i18n/'),
        watch: true,
      },
      resolvers: [new HeaderResolver(['x-lang'])],
      typesOutputPath: join(__dirname, '../src/.generate/i18n.generated.ts'),
    }),
    MockModule,
    RedisModule,
    LockerModule.register({
      global: true
    }),
  ],
  controllers: [HealthCheckController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RejectRequestGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionGuard,
    },
    InstallLock,
  ],
})
export class AppModule implements OnModuleInit {
  constructor(
    private lang: I18LangService,
    private i18: I18Service,
    private lock: InstallLock,
    private redis: RedisService,
    private cfg: ConfigService<Configure>,
    private menuInit: MenuInitializer,
    private roleInit: RoleInit,
    private permissionInit: PermissionInit,
    private userInit: UserInit,
    private applicationInit: ApplicationInit
  ) {}
  async isInstalled(redis: Redis) {
    return redis.exists(INSTALL_FLAG);
  }
  async setIsInstalled(redis: Redis){
    return redis.set(INSTALL_FLAG, '1');
  }
  async onModuleInit() {
    const IS_PREVIEW_MOD = this.cfg.get('PREVIEW_MODE');
    if (IS_PREVIEW_MOD) {
      Logger.warn('You are currently in demonstration mode. All additions, deletions, and modifications request will be rejected');
      Logger.warn('If you want to disable the demo mode, please set the `PREVIEW_MODE` environment variable to `false`')
      Logger.warn('Alternatively, you can create an `.env` file and set `PREVIEV_MODE` to `false`')
    }
    const redis = this.redis.getRedis();
    if (await this.isInstalled(redis)){
      Logger.warn(
        `Lock file exists, if you want init again, please remove ${INSTALL_FLAG} in your redis`
      );
      return;
    }
    if (await this.lock.exist()){
      if (await this.lock.wait(MAX_RETRY)) {
        // 其他节点安装完成可以直接跳出初始化.
        if (await this.isInstalled(redis)) {
          return;
        }
        Logger.error('Install fail! Please restart application');
        process.exit(-1);
      }
      Logger.error('Wait timeout. Please restart your application');
      process.exit(-1);
    }
    const lockStatus = await this.lock.lock(60 * 5);
    // 无法上锁意味着有人持有了锁
    if (!lockStatus) {
      const waitStatus = await this.lock.wait(MAX_RETRY);
      // 超时直接退出
      if (!waitStatus) {
        Logger.error('Wait timeout. Please restart your application');
        process.exit(-1);
      }
      if (await this.isInstalled(redis)){
        return;
      }
      // 没有超时, 但是没有安装完成
      // 这里只能是因为异常导致锁自然消失
      Logger.error('Install fail! Please clear database and restart application');
      process.exit(-1);
    }
    if (await this.isInstalled(redis)) {
      Logger.log('Already installed');
      await this.lock.release();
      return;
    }

    // 续期五分钟.
    await this.lock.extend(60 * 5);
    try {
      const I18_INIT_FILE_PATH = join(process.cwd(), 'locales.json');
      const I18_INIT_FILE = JSON.parse(
        readFileSync(I18_INIT_FILE_PATH).toString()
      );
      const dbLangNames = (await this.lang.findAll()).map((lang) => lang.name);
      const langs = Object.keys(I18_INIT_FILE).filter(
        (key) => !dbLangNames.includes(key)
      );
      for (const name of langs) {
        const { id } = await this.lang.create({ name });
        for (const [key, value] of Object.entries(I18_INIT_FILE[name])) {
          const dbValue = await this.i18.has(key, id);
          if (dbValue) {
            Logger.warn(`${name} - ${key} exists value is ${dbValue.content}`);
            continue;
          }
          Logger.log(`${name} - ${key} not exists`);
          await this.i18.create({ key, content: value as string, lang: id });
          Logger.log(`${name} - ${key} save success`);
        }
      }

      await this.applicationInit.run();
      await this.menuInit.run();
      await this.permissionInit.run();
      await this.roleInit.run();
      await this.userInit.run()
      await this.setIsInstalled(redis);
    } catch (e) {
      const err = e as HttpException;
      Logger.error(err.message);
      Logger.error(`Please clear the database and try again`);
      await this.lock.release();
      process.exit(-1);
    } finally {
      await this.lock.release();
    }
  }
}
