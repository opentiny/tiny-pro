---
title: "后端指南"
---

# 后端指南

---

在阅读本指南前，我们假设您已经阅读过[Nest.js官方文档](https://docs.nestjs.com/)并能够独立本机启动`MySQL`与`Redis`的能力。

## 项目初始化

[快速开始](./quick-start)

## 后端启动

开发阶段通常不会使用docker进行启动，更多的是本地启动。首先我们要配置环境变量文件, 也就是`.env`文件.

| 配置项 | 类型 | 描述 |
|--------|------|------|
| DATABASE_HOST | string | 数据库IP |
| DATABASE_PORT | string | 数据库端口 |
| DATABASE_USERNAME | string | 数据库用户名 |
| DATABASE_PASSWORD | string | 数据库密码 |
| DATABASE_NAME | string | 数据库名 |
| DATABASE_SYNCHRONIZE | boolean | 是否自动同步<br/>这很危险, 如果设置为true, 请确保你的DATABASE_HOST是本地环境！ |
| DATABASE_AUTOLOADENTITIES | boolean | 是否自动加载Entry (建议设置为true) |
| AUTH_SECRET | string | JWT secrect |
| REDIS_SECONDS | number | AccessToken过期时间 |
| REDIS_HOST | string | Redis IP |
| REDIS_PORT | string | 数据库 端口 |
| EXPIRES_IN | string | JwT过期时间 (已废弃) |
| PAGINATION_PAGE | number | 默认页码 |
| PAGINATION_LIMIT | number | 默认页大小 |
| GLOBAL_PREFIX | string | api全局前缀 |
| MOCK_REGEX | string | mock接口glob表达式 |
| REFRESH_TOKEN_TTL | number | 刷新令牌过期时间 |
| DEVICE_LIMIT | number | 设备数量限制, -1表示无限制 |
| PREVIEW_MODE | boolean | 是否启用演示模式, 如果设置为true, 则会拒绝所有的增加、修改、删除操作 |
| ENABLE_SWAGGER | boolean | 是否启用SWAGGER |
| SWAGGER_TITLE | string | Swagger文档标题 |
| SWAGGER_DESC | string | Swagger文档简介 |
| SWAGGER_VERSION | string | Swagger文档版本 |

### 开发前检查清单

- [ ] 后端项目已被初始化
- [ ] `.env`文件中`DATABASE_HOST`**是开发环境**
- [ ] `.env`文件中`DATABASE_NAME`为开发库
- [ ] `.env`文件中`DATABASE_NAME`存在
- [ ] `.env`文件中`DATABASE_SYNCHRONIZE`为`true`
- [ ] `.env`文件中`REDIS_HOST`**是开发环境**
- [ ] MySQL服务可以正常访问
- [ ] Redis服务可以正常访问
- [ ] `dist`目录被删除 (可选,如果你不需要测试初始化数据的话)

配置好文件后您可以运行`npm run start:dev`来运行后端服务。当出现下述字样时，表示后端启动成功。

```
LOG [NestApplication] Nest application successfully started +11ms
Application is running on: http://[::1]:3000
```

### 生成迁移文件

有时，我们需要改动数据库结构。在修改完成后**必须**执行`pnpm run migrate:gen`来生成迁移文件。在运行该命令期间，请确保开发环境数据库可以访问。

#### 修改表结构

假设我们修改了 `User` 表. 它位于 `nestJs/libs/models/src` 下.

```diff
export class User {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  name: string;
  @Column()
+ nickName: string;
}
```

#### 运行迁移文件生成指令

1. 请确保你在`.env`文件中设置的`DATABASE_HOST`为开发数据库。
2. 运行 `pnpm run migrate:gen`
3. 当出现`Success! Migration file created at migrations/<运行时的时间戳>-TinyPro.js`命令后则表示迁移文件生成成功
4. 运行 `pnpm run migrate:run`指令或`node migrate.js`来应用迁移文件。当出现了 `Now you can safely launched the project` 字样。表示迁移文件已经被安全的应用到了数据库中。

## 初始化数据

有些时候我们需要自动初始化一些数据(比如前端的默认国际化字段). 这些逻辑**均需**写在`App.module.ts`中`AppModule`类中的`onModuleInit`函数中。

## 国际化

> 这里的国际化指的是报错信息的国际化

后端采用的是`nestjs-i18n`依赖库。国际化词条放在`i18n/<lang>/xxx.json`下

```
i18n
  enUS
    exception.json
    validation.json
  zhCN
    exception.json
    validation.json
```

目前仅支持`enUS`与`zhCN`两种语言，且`fallback`为`enUS`.

### 报错时候使用国际化词条

后端服务遵循`Restful`规范，可以直接抛出错误使用HttpStatusCode来代替错误代码。如果需要使用国际化词条，请确保该词条已经存在于`enUS|zhCN/exception.json`文件内。假设有一个服务`PolicyService`需要抛出一个`409`错误。

1. 添加国际化词条
2. 在服务中注入`I18nService`
3. 使用该词条

在 `zhCN/exception.json` 中补充 `policy.exists`，文件中原有字段保持不变：

```json
{
  "policy": {
    "exists": "Policy已存在"
  }
}
```

```ts
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { I18nTranslations } from '../.generate/i18n.generated';
import { I18nContext, I18nService } from 'nestjs-i18n';
@Injectable()
export class PolicyService {
  constructor(
    private readonly i18n: I18nService<I18nTranslations>
  ) {}
  createPolicy(){
    const exists = ...;
    if (exists){
      throw new HttpException(
        this.i18n.translate('exception.policy.exists', {
          lang: I18nContext.current().lang,
        }),
        HttpStatus.CONFLICT // 409
      )
    }
    //....
  }
}
```

## 接口权限管理

### Token管理

凡是**没有**被`Public`修饰器修饰的接口，均会被`auth/auth.guard.ts`进行校验，如果**token不存在**、**token过期**、**token不合法**，均不允许访问。

### 权限控制

如果一个接口没有被`Permission`修饰器进行修饰，那么这个接口是**允许**所有**已经登录**的用户访问。如果一个接口**被**`Permission`修饰器进行修饰，那么该接口**仅允许**拥有该权限的用户访问，其余用户会返回**403**错误代码

默认`admin`用户存在超级权限`(*)`, 拥有该权限且已经登陆的用户可以访问任何接口。

例如

```ts
@Controller('/policy')
export class PolicyController {
  @Get('/list')
  async getPolicy(){}
}
```

上述代码中`GET /policy/list`是一个不公开，不受保护的接口。我们可以使用`Permission`修饰器对他进行权限认证，当且仅当用户角色存在`policy::get::list`权限时才放行

```ts
@Controller('/policy')
export class PolicyController {
  @Get('/list')
  @Permission('policy::get::list')
  async getPolicy(){}
}
```

这样一来`GET /policy/list`就只允许拥有`policy::get::list`权限的角色访问，其余角色访问则会返回一个403错误

但有些时候我们需要一个接口允许未登陆的用户访问。例如我们在登陆的时候经常需要获取免责声明，那么我们就可以写一个`GET /policy`接口，用于获取一个免责声明的法律条文。

所以我们可以添加如下

```ts
@Controller('/policy')
export class PolicyController {
  @Get('/list')
  @Permission('policy::get::list')
  async getPolicies(){}
  @Get('/')
  @Public()
  async getPolicy(){}
}
```

这样一来`GET /policy/list`接口只允许**登录**且**拥有policy::get::list**权限的角色访问。`GET /policy`接口则允许**未登陆**的**所有角色**进行访问。

如果未来的某一天，我们需要让`/policy/*`都允许未登录的用户访问，那么我们可以这么写

```ts
@Public()
@Controller('/policy')
export class PolicyController {
  @Get('/list')
  async getPolicies(){}
  @Get('/')
  async getPolicy(){}
}
```

这样一来，所有的policy接口都可以被未登录的用户访问了

## 遇到困难?

加官方小助手微信 opentiny-official，加入技术交流群

## 常见问题

### 打包速度慢

请阅读[SWC](https://docs.nestjs.com/recipes/swc)

### 提示 `Lock file exists, if you want init agin, please remove dist or dist/lock`

- 对于 `1.x` 用户来说可以直接删除 `dist/lock` 文件夹.
- 对于 `2.x` 用户来说可以在redis中执行 `DEL FLAG:INSTALL`

### docker 部署时数据库超时

在新版本中我们加入了 `wait4x` 来检查 `mysql` 容器情况。但这并不能完全避免因为 `mysql` 启动过慢而导致的容器启动失败。在业务容器中我们设定的轮询时间为2s, 最多等待60s. 如果超时请按照如下检查表逐一排查

1. MySQL容器是否启动成功?
2. MySQL容器是否初始化成功?
3. 业务容器环境变量是否正确?
