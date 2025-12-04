import { SequelizeModule } from '@nestjs/sequelize';
import {
  HttpException,
  Logger,
  LoggerService,
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
import { existsSync, readFileSync, writeFileSync, mkdirSync, unlinkSync } from 'fs';
import { UserService } from './user/user.service';
import { RoleService } from './role/role.service';
import { PermissionService } from './permission/permission.service';
import { MenuService } from './menu/menu.service';
import { Permission } from '@app/models';
import { MenuModule } from './menu/menu.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { menuData } from './menu/init/menuData';
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
import { applicationData } from './application/init/data';
import { CONFIG_SCHEMA } from './config-schema';
import { InstallLock } from './install-lock';
import { RedisService } from '../libs/redis/redis.service';
import Redis from 'ioredis';
import { RedisModule } from '../libs/redis/redis.module';

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
    RedisModule
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
    private user: UserService,
    private role: RoleService,
    private permission: PermissionService,
    private menu: MenuService,
    private lang: I18LangService,
    private i18: I18Service,
    private application: ApplicationService,
    private lock: InstallLock,
    private redis: RedisService
  ) {}
  async isInstalled(redis: Redis) {
    return redis.exists(INSTALL_FLAG);
  }
  async setIsInstalled(redis: Redis){
    return redis.set(INSTALL_FLAG, '1');
  }
  async onModuleInit() {
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
      const permissions = {
        user: [
          'add',
          'remove',
          'update',
          'query',
          'password::force-update',
          'batch-remove',
        ],
        permission: ['add', 'remove', 'update', 'get'],
        role: ['add', 'remove', 'update', 'query'],
        menu: ['add', 'remove', 'update', 'query'],
        i18n: ['add', 'remove', 'update', 'query', 'batch-remove'],
        lang: ['add', 'remove', 'update', 'query'],
      };
      const tasks = [];
      const isInit = true;
      let permission = await this.permission.create(
        {
          name: '*',
          desc: 'super permission',
        },
        isInit
      );;
      for (const [module, actions] of Object.entries(permissions)) {
        for (const action of actions) {
          tasks.push(
            this.permission.create(
              {
                name: `${module}::${action}`,
                desc: '',
              },
              isInit
            )
          );
        }
      }
      // TODO Menu
      for (const item of menuData) {
        await this.menu.createMenu(item, isInit);
      }

      // application
      for (const item of applicationData) {
        await this.application.createApplication(item, isInit);
      }

      const status = Promise.allSettled(tasks);
      const statusData = await status;
      const hasFail = statusData.some((data) => data.status === 'rejected');
      if (hasFail) {
        const fail: any[] = statusData.filter(
          (data) => data.status === 'rejected'
        );
        fail.forEach((data) => {
          Logger.error(`${data.reason}`);
        });
        Logger.error('Please clear the database and try again');
        await this.lock.release();
        process.exit(-1);
      }

      const menuId = this.menu.getMenuAllId();
      const role = await this.role.create(
        {
          name: 'admin',
          permissionIds: [permission.id],
          menuIds: await menuId,
        },
        isInit
      );
      const user = await this.user.create(
        {
          email: 'admin@no-reply.com',
          password: 'admin',
          roleIds: [role.id],
          name: 'admin',
          status: 1,
        },
        isInit
      );
      Logger.log(`[APP]: create admin user success`);
      Logger.log(`[APP]: email: ${user.email}`);
      Logger.log(`[APP]: password: 'admin'`);
      Logger.log('Enjoy!');
      await this.setIsInstalled(redis);
    } catch (e) {
      const err = e as HttpException;
      Logger.error(err.message);
      Logger.error(`Please clear the database and try again`);
      process.exit(-1);
    } finally {
      await this.lock.release();
    }
  }
}
