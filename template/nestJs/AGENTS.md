# TinyPro NestJS 后端模板指南

本文件面向在本项目（TinyPro 脚手架生成的 NestJS 后端）内工作的 AI Agent 与开发者。

## 技术栈

NestJS 10 + TypeORM（`@nestjs/typeorm`，另有 sequelize 依赖）+ MySQL + Redis（ioredis/redis）、JWT 鉴权（`@nestjs/jwt` + jose）、nestjs-i18n、Swagger（`@nestjs/swagger`）、winston 日志、Jest 测试。

## 常用命令

```bash
pnpm start:dev        # 开发模式（nest start --watch），端口 3000
pnpm start:mock       # MOCK_MODE=true，内置 mock 数据，无需真实数据库
pnpm build            # nest build → dist/
pnpm test             # jest（单测在各模块 __tests__/ 或 *.spec.ts）
pnpm lint             # eslint --fix
pnpm migrate:gen      # 生成数据库迁移
pnpm migrate:run      # 执行迁移（node migrate.js）
```

Swagger 文档：`http://localhost:3000/api`（`GLOBAL_PREFIX` 默认 `/api`）。

## 环境依赖

开发模式需要本机可用的 **MySQL 与 Redis**，配置在 `.env`（参考 `.env.example`）：`DATABASE_HOST/PORT/NAME/USERNAME`、`DATABASE_SYNCHRONIZE`、`DATABASE_AUTOLOADENTITIES`、`REDIS_HOST/PORT` 等。没有数据库时用 `pnpm start:mock`。

## 目录结构

```bash
src
├── auth          # 登录/JWT（auth.guard.ts 全局守卫、token.service.ts）
├── user          # 用户
├── role          # 角色
├── permission    # 权限（permission.guard.ts 全局守卫）
├── menu          # 菜单树（前端动态菜单的数据源）
├── i18           # 国际化词条与语言
├── mock          # MOCK_MODE 下的 mock 模块与中间件
├── public        # 公共装饰器/守卫/拦截器（见下）
├── demo/         # 演示业务模块（employees、application、project、editor 等）
├── app.module.ts # 根模块，注册全局守卫与各初始化器
└── main.ts       # 入口：全局前缀、校验管道、Swagger
libs              # 共享库（@app/db、@app/models、@app/locker、redis 等）
```

## 核心约定

1. **鉴权与授权**：`AuthGuard` 与 `PermissionGuard` 通过 `APP_GUARD` 全局注册。
   - 接口要权限控制时加 `@Permission('模块::操作')`（`src/public/permission.decorator.ts`），与前端 `v-permission` 的值一一对应。
   - 需要跳过鉴权的公开接口用 `src/public/public.decorator.ts`；`@Reject` 用于拒绝特定请求。
2. **初始化器**：各模块的 `*.initializer.ts`（如 `menu.initializer.ts`、`role.initializer.ts`）在启动时灌入种子数据（菜单、角色、权限、用户）。新增内置权限/菜单时优先改对应 initializer，而不是手动写 SQL。
3. **DTO 校验**：入参用 `dto/` 下的 class 加 `class-validator` 装饰器；全局 `I18nValidationPipe` 负责校验与报错翻译。
4. **接口文档**：controller 方法补 `@ApiOperation`/`@ApiOkResponse` 等 Swagger 装饰器。
5. **统一响应**：`src/public/http-response.interceptor.ts` 与 `http-response.exception-filter.ts` 已统一出参/异常结构，不要在 controller 里自行拼装响应码。
6. **i18n**：错误文案等走 nestjs-i18n（`HeaderResolver` 解析请求头语言）。

## 与前端的联动

本服务是 TinyPro Vue 前端（`template/tinyvue`）的数据源：菜单树、权限、角色、用户、国际化词条全部由这里持久化。改动这些域的接口时，检查前端 `src/api/`（menu.ts、permission.ts、role.ts、user.ts、lang.ts 等）是否需要同步；接口路径带全局前缀（默认 `/api`，前端按 `/api/v1` 代理/mock 前缀处理）。
