---
title: "目录结构"
---

<h1 id='structure'>目录结构</h1>

---

良好的项目目录组织结构可以使你的工程更清晰。

<h2 id='directory'>目录</h2>

当您初始化项目后，可以看到 `TinyPro of Vue` 的项目目录结构如下：

```bash
├── node_modules  (为整个工作空间提供 npm 包)
├── src  (页面代码)
├── env (环境变量配置)
├── .editorconfig
├── .eslintrc.js
├── .gitignore
├── config (为工作区中的所有项目指定 CLI 的默认配置)
├── package.json  (配置工作空间中所有项目可用的 npm 包依赖)
├── README.md
├── tsconfig.json  (工作空间中所有项目的基本 TypeScript 配置)
```

<h3 id='page'>页面代码结构</h3>

`src` 目录下是页面代码，对于大多数的情况，您只需要开发 `src` 目录下的文件。
推荐您在开发的过程中，遵守现有的目录结构，以使项目代码的组织结构更加规范。

> 若一个组件被多个页面所依赖，我们推荐您放到 `src/components` 中；
> 若只是被单个页面依赖的组件，我们推荐您放到就近的 `view` 目录。

```bash
|-- src
    |-- index.html  (主要 HTML 页面)
    |-- main.ts  (应用的主要挂载入口)
    |-- api  (包含接口和mock数据的文件)
    |-- assets (包含静态资源，国际化等文件)
    |   |-- style
    |   |-- img
    |-- components  (包含封装的组件文件)
    |   |-- breadcrumb (路由面包屑)
    |   |-- footer (底部)
    |   |-- global-setting (页面陪住)
    |   |-- menu (路由菜单)
    |   |-- navbar (头部导航)
    |   |-- theme (右下角主题切换)
    |-- directive (自定义指令)
    |-- hooks (自定义hook)
    |-- layout (页面布局)
    |-- locale  (国际化配置文件)
    |-- mock  (mock数据)
    |-- router  (router配置)
    |-- store  (pinia定义的状态管理)
    |-- types  (ts定义类型)
    |-- utils  (全局方法)
    |-- views  (项目页面)
    |   |-- board (看板页)
    |   |-- exception (异常页)
    |   |-- form (表单页)
    |   |-- list (列表页)
    |   |-- login (登录页)
    |   |-- not-found (404页)
    |   |-- profile (详情页)
    |   |-- result (结果页)
    |   |-- user (个人中心)
    |-- env (包含特定目标环境的构建配置选项)
```
