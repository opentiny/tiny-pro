# TinyPro 仓库指南

本文件面向在本仓库内工作的 AI Agent 与贡献者。

## 项目定位

`@opentiny/tiny-toolkit-pro`：一个 Tiny CLI 工具包（toolkit），用于初始化「开箱即用、前后端分离」的中后台项目。包本体是脚手架逻辑，真正的应用代码在 `template/` 下的各套模板里。

## 仓库结构

```bash
├── src/lib          # toolkit 源码（init/build/start 等命令逻辑，TypeScript）
├── dist             # tsc 本地构建产物（已被 .gitignore 忽略，不纳入版本控制）
├── template
│   ├── tinyvue      # 前端模板（Vue3 + Vite + TinyVue），有自己的 AGENTS.md
│   ├── nestJs       # NestJS 后端模板，有自己的 AGENTS.md
│   ├── springboot   # Spring Boot 后端模板
│   └── lowcode-designer  # 低代码设计器模板
├── docs             # VitePress 文档站（用户文档，中文）
├── tests            # Playwright e2e（tests/playwright-webserver.test.mjs 驱动 playwright-webserver.mjs）
└── tiny.config.js   # Tiny CLI 配置
```

`pnpm-workspace.yaml` 将 `template/*` 声明为 workspace 包，模板间通过 `pnpm -F <name>` 过滤操作。

## 常用命令

```bash
pnpm install          # 安装依赖（pnpm workspace）
pnpm build            # 编译 toolkit：tsc -p tsconfig.json → dist/
pnpm test             # build + lint + 后端单测 + e2e（完整链路）
pnpm test:lint        # tslint --project . + prettier 校验（只覆盖 src/**/*.ts）
pnpm test:e2e         # node --test tests/playwright-webserver.test.mjs && playwright test
pnpm dev              # 启动 tinyvue 模板（mock 模式）
pnpm nest:mock        # 启动 后端 nestJs 模板（mock 模式）
pnpm dev:backend      # 启动 nestJs 模板
pnpm docs:dev         # 本地预览文档站
```

## 代码风格

- 本仓库 `src/`：tslint（`tslint.json`）+ Prettier（singleQuote），不是 ESLint。改完跑 `pnpm fix` 或 `pnpm test:lint`。
- `template/tinyvue` 与 `template/nestJs`：各自使用 ESLint，规则见模板内配置，不要跨模板套用。
- 文档为中文，文档站用 VitePress（`docs/.vitepress/config.mts`）。

## 修改时的注意点

1. **改 `template/` 下的文件会影响所有脚手架产物**，等于在改所有未来用户的项目，需按发布标准对待。
2. `dist/` 是本地构建产物，已被 `.gitignore` 忽略，不纳入版本控制；改 `src/` 后无需提交 `dist/`，需要本地产物时运行 `pnpm build:main`（发布时 `prepublishOnly` 会自动重建）。
3. 前端/后端的「菜单、权限、角色、用户、国际化」是前后端联动的功能：改 tinyvue 侧交互时，检查 nestJs 侧对应接口是否也要动（`template/nestJs/src/{menu,permission,role,user,i18}`）。
4. 新增页面/菜单的标准流程以「后台管理系统动态下发」为准，见 `template/tinyvue/AGENTS.md`。
