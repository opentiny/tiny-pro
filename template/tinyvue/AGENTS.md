# TinyPro Vue 前端模板指南

本文件面向在本项目（由 TinyPro 脚手架生成的 Vue 中后台）内工作的 AI Agent 与开发者。

## 技术栈

Vue 3 + TypeScript + Vite（默认，另有 webpack/rspack/farm 配置可选）、TinyVue（`@opentiny/vue` 系列）、Pinia、Vue Router、vue-i18n、axios。

## 常用命令

```bash
pnpm dev              # 开发模式（连真实后端），端口 3031
pnpm start:mock       # mock 模式：同时启动 vite 与 tsx mock 服务（src/mock）
pnpm build            # 生产构建（config/vite.config.prod.ts）
pnpm lint             # eslint
pnpm test:mock        # mock 与 utils 的 node 测试
```

页面访问路径带上下文前缀 `VITE_CONTEXT`（如 `/vue-pro/`），路由跳转、菜单 url 都要考虑它。

## 目录约定

```bash
src
├── api          # 接口封装（axios，拦截器在 api/interceptor.ts）
├── assets       # 静态资源
├── components   # 跨页面复用的公共组件
├── directive    # 自定义指令（v-permission 在这里）
├── hooks        # 组合式函数
├── layout       # 布局组件（页面一般用 general-layout）
├── locale       # 本地国际化文件（zh-CN/ en-US/）
├── mock         # mock 服务（tsx 运行）
├── router       # 路由（见下）
├── store        # Pinia（modules/ 下按域划分）
├── utils        # 工具（utils/auth.ts 管 token）
└── views        # 页面，按业务域分目录
```

组件放置规则：**被多个页面依赖的组件放 `src/components`，只被单个页面用的放该页面目录就近维护**（如 `views/role/info/components/`）。

## 路由与菜单（重要）

**业务页面的菜单是后端动态下发的，不要通过手写静态路由新增页面。**

- `src/router/constant.ts` 只放框架级路由（login、redirect、404、布局容器 root）。
- 菜单数据由后端下发，`src/router/guard/menu.ts` 的 `flushRouter`/`toRoutes` 把菜单树的 `component` 字段（如 `test-page/index.vue`）映射到 `src/views/**` 下的组件，挂到 `root` 布局下。组件文件不存在时会落到内置 NotFound 组件。
- `src/router/routes/modules/*.ts` 中的静态路由仅用于登记**不进侧边栏的隐藏子页面**（`meta.hidden`，如富文本创作页），由 `registerHiddenSubRoutes` 挂到已存在的菜单路由下。新增普通页面不要往这里加。

## 新增页面标准流程（以后台菜单管理为准）

完整步骤说明见 `.agents/skills/create-page/SKILL.md`，简述：

1. 在 `src/views/<page-name>/index.vue` 新建页面（目录用 kebab-case）。
2. 在后台「系统管理 > 国际化管理」新增词条，Key 用 `模块::页面::元素` 格式（如 `test::page::title`），zhCN/enUS 各一条。
3. 在后台「系统管理 > 查看菜单」添加菜单：组件路径**不含** `src/views` 前缀（如 `test-page/index.vue`），国际化填上一步的 Key。
4. 在后台「系统管理 > 查看角色」把菜单绑定给角色，左侧导航才会出现。

## 页面开发规范

- 页面组件统一用 `<script lang="ts" setup>`，布局用 `general-layout` 并通过 `breadcrumb` 传国际化词条 Key：

```html
<general-layout :breadcrumb="['test::page::title']">
  <!-- 页面内容 -->
</general-layout>
```

- 组件库优先使用 TinyVue（`@opentiny/vue`、`@opentiny/vue-icon`、图表用 `@opentiny/vue-huicharts`），不要引入新的组件库。
- 按钮级权限用 `v-permission` 指令，权限名格式 `模块::操作`（如 `user::add`），权限本身在后台「权限管理」维护并绑定到角色。
- 文案一律走国际化，不写死中文；词条在后台维护，本地 `src/locale/` 文件作为内置兜底。
- 接口请求在 `src/api/` 下按域新增文件，复用 `api/interceptor.ts` 的 axios 实例；mock 数据在 `src/mock/` 维护。
- 状态用 Pinia，按域放 `src/store/modules/`。

## 与后端的联动

菜单、权限、角色、用户、国际化词条都持久化在后端（NestJS 模板，`template/nestJs` 或独立仓库）。涉及这些域的改动要同时检查两端；接口约定：`/api` 前缀（见 `nestJs` 侧 `GLOBAL_PREFIX`）。
