# AGENTS.md

本文件面向 AI 编码代理，介绍 tiny-pro 仓库的整体情况、构建测试命令与开发约定。阅读本文件前无需了解本项目。

## 项目概述

本仓库是 `@opentiny/tiny-toolkit-pro`（TinyPro），[TinyCLI](https://www.opentiny.design/tiny-cli) 的一个开发套件（toolkit）。TinyCLI 是 OpenTiny 团队的前端工程化 CLI 工具；TinyPro 用于一行命令（`tiny init pro`）初始化一个开箱即用、前后端分离的 Vue 中后台管理系统模板。

套件本身是一个 Node.js CLI 程序（TypeScript 编写，CommonJS 输出到 `dist/`），核心职责是：

1. 通过交互式问询（inquirer）收集用户选择：项目名称/描述、服务端框架（NestJS / SpringBoot / 暂不配置）、是否集成低代码设计器、构建工具（Vite / Webpack / Rspack / Farm）、数据库（MySQL）与 Redis 连接信息；
2. 将 `template/` 下的模板复制到目标目录，并根据用户选择改写 `package.json`（增删依赖与脚本）、`dev.env`、`docker-compose.yml`（NestJS）或 `application.properties`（SpringBoot）；
3. 提供 `start` / `build` / `help` 命令，透传执行生成项目的 npm 脚本。

仓库还包含一套完整的 monorepo 式模板（`pnpm-workspace.yaml` 声明 `template/*` 为 workspace 包），方便本地直接开发与调试模板代码。

## 目录结构

```
src/                 套件 CLI 源码（TypeScript，编译到 dist/）
  index.ts           导出 start / build / init / help 四个命令
  lib/
    init.ts          初始化核心：交互问询、模板拷贝、配置改写、依赖安装
    interfaces.ts    枚举与常量（ServerFrameworks / BuildTool / 各构建工具的命令与依赖清单）
    utils.ts         路径工具（getTemplatePath / getDistPath）、命名转换
    start.ts         tiny start：安装依赖并执行 npm run start
    build.ts         tiny build：透传 npm run build
    help.ts          帮助信息
template/
  tinyvue/           前端模板（包名 tiny-pro-vue），Vue 3 + @opentiny/vue
  nestJs/            后端模板（包名 tinyui-nestjs-server），NestJS 10 + TypeORM + MySQL + Redis
  springboot/        后端模板（Java / Spring Boot + MyBatis-Plus + JPA）
  lowcode-designer/  低代码设计器模板（基于 TinyEngine）
tests/e2e/           Playwright 移动端 E2E 用例
.github/workflows/   CI：E2E 测试、后端单测、发布、部署等
tiny.config.js       TinyCLI 套件配置（声明 toolkit 类型与 start/build 前置任务）
```

前端模板 `template/tinyvue/src/` 的主要模块：`api/`（axios 接口封装）、`router/`（vue-router，含路由守卫）、`store/`（pinia）、`views/`（board、form、list、login、menu、permission、role、user 等业务页面）、`layout/`、`locale/`（vue-i18n）、`mock/`（vite-plugin-mock 或 tsx 启动的 mock 服务）、`hooks/`、`directive/`、`utils/`、`config/`。构建配置同时存在四套：`config/vite.config.*.ts`、`webpack.config.js`、`rspack.config.js`、`farm.config.ts`，由 `tiny init` 按用户选择裁剪。

后端模板 `template/nestJs/src/` 按业务域划分模块：`auth`（JWT 认证）、`user`、`role`、`menu`、`permission`（角色/用户/菜单/组件的细粒度权限）、`employees`、`i18`（多语言）、`mock`、`application`（应用初始化）。每个模块遵循 NestJS 惯例的 `*.module.ts / *.controller.ts / *.service.ts / dto / entity` 结构，部分模块带 `__tests__` 目录。

## 构建与常用命令

在仓库根目录（需 Node.js ≥ 8.9，实际开发建议 Node 18+；包管理器为 pnpm 10）：

```bash
pnpm i                # 安装全部 workspace 依赖
pnpm build            # tsc 编译套件源码到 dist/（build:main）
pnpm watch            # 监听编译套件源码
pnpm fix              # prettier --write + tslint --fix 修复 src/
pnpm test             # build + test:**（lint + 后端单测/覆盖率）
pnpm test:lint        # tslint 检查 + prettier 校验
pnpm test:unit        # build + lint + 后端 jest 单测 + 覆盖率
pnpm test:e2e         # Playwright 测试（自动启动 template/tinyvue 前端）
pnpm dev              # 启动前端模板（pnpm -F tiny-pro-vue start，端口 3031）
pnpm dev:backend      # 启动 NestJS 后端模板（需要 MySQL / Redis）
```

注意：`package.json` 中配置了 ava（测试 `build/main/**/*.spec.js`），但 `test:unit` 实际跑的是后端 jest；`cov` / `cov:check`（nyc 要求 100% 覆盖）脚本来自脚手架模板，目前并非 CI 实际使用的路径。

前端模板内部命令（`template/tinyvue`）：`pnpm start`（vite 开发，端口 3031，base 路径 `/vue-pro`）、`pnpm build`、`pnpm mock`（tsx 启动独立 mock 服务）、`pnpm lint` / `lint:fix`（eslint 9，@antfu/eslint-config）、stylelint 由 lint-staged 触发。

后端模板内部命令（`template/nestJs`）：`pnpm start` / `start:dev` / `start:prod`（pm2）、`pnpm test`（jest）、`pnpm test:cov`、`pnpm migrate:gen` / `migrate:run`（TypeORM 迁移）。

## 测试策略

- **后端单测**：NestJS 模板使用 jest + ts-jest，测试文件为 `*.spec.ts`（多在各模块的 `__tests__/` 中），CI 工作流 `unit-test.yaml` 运行。
- **E2E 测试**：根目录 Playwright 配置（`playwright.config.ts`），只覆盖移动端视口（iPhone 12、Pixel 5、iPad gen 5），用例在 `tests/e2e/mobile/`（grid / modal / navbar / tree-menu）。`webServer` 会自动启动 `template/tinyvue`；CI（`e2e-test.yml`）还会用 docker compose 启动 NestJS 后端并等待 `/healthCheck` 就绪。E2E 仅在 `template/tinyvue/**` 变更的 PR 上触发。
- **覆盖率**：根目录 `cov:check` 要求 100%（历史脚本，非 CI 强制）；后端 jest 通过 `coveragePathIgnorePatterns` 排除了 controller/dto/entity/module/decorator/mock 等文件。

## 代码风格与约定

- 套件源码（`src/`）使用 **TSLint**（`tslint.json`，继承 tslint-config-airbnb + tslint-config-prettier）+ **Prettier**（单引号 `singleQuote: true`）。注意 TSLint 已废弃，但本项目仍沿用，修改 `src/` 后需通过 `pnpm test:lint`。
- TSLint 的 `linterOptions.exclude` 排除了整个 `template/` 目录——模板子项目各有自己的 lint 配置，不受根目录 TSLint 约束。
- 前端模板使用 ESLint 9（`@antfu/eslint-config`）+ UnoCSS 插件 + stylelint，commit 由 husky + lint-staged + commitlint（conventional commits）把关。
- 套件代码中的注释、日志与交互文案均为**中文**，提交信息遵循 conventional commits（如 `feat: ...`、`fix: ...`，见 `package.json` 的 changeLog）。
- 模板拷贝使用 `fs.copyTpl`（@opentiny/cli-devkit），路径工具统一走 `src/lib/utils.ts`；新增模板或构建工具选项时，需同步维护 `src/lib/interfaces.ts` 中的命令、依赖增删清单（`buildCommand` / `devCommand` / `devDependencies` / `removeDependencies` / `buildConfigs`）。

## 运行与部署架构

- 生成的项目默认结构：`tiny-pro/web`（前端）+ `tiny-pro/nestJs` 或 `tiny-pro/springboot`（后端）+ 可选 `tiny-pro/lowcode-designer`。
- 前端开发端口 **3031**，base 路径 `/vue-pro`；后端默认端口 **3000**，提供 `/healthCheck` 健康检查。
- 后端依赖 **MySQL**（typeorm/sequelize，启动时 `DATABASE_SYNCHRONIZE=true` 自动建表并填充种子数据）和 **Redis**（缓存/登录态）。环境变量从 `.env` 读取，模板提供 `.env.example`。
- NestJS 后端支持 Docker 启动（`template/nestJs/docker-compose.yml` 包含 MySQL/Redis 服务）；SpringBoot 后端有独立 `Dockerfile` 与 `docker-compose.yml`。
- 发布：`auto-publish.yml` / `dispatch-publish.yml` 将套件发布到 npm；`deploy-github.yml` / `deploy-obs.yml` 部署文档/站点。

## 安全注意事项

- `.env` 文件包含数据库密码、JWT 密钥等敏感信息，**绝不能**提交或打印到日志；模板仓库中只应存在 `.env.example`。
- 套件初始化时会把用户输入的数据库密码写入目标项目的 `.env` 与 `docker-compose.yml`，处理这些文件时注意不要在错误信息中回显敏感内容。
- 修改 `init.ts` 中 SpringBoot/NestJS 配置改写逻辑时，保持默认值与 `properties-parser` / yaml 读写方式一致，避免破坏已有用户的初始化流程。
