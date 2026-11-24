---
name: create-page
description: 在 TinyPro Vue 项目中按标准流程新增页面：建视图组件、加国际化词条、后台菜单管理登记、角色绑定
whenToUse: 当用户要求新增页面、新增菜单、把某个页面挂到左侧导航时使用
type: prompt
arguments:
  - page_name
---

请在当前 TinyPro Vue 项目中新增页面 `$page_name`，严格按以下流程执行。**本项目的菜单由后台管理系统动态下发，不要在 `src/router/constant.ts` 或 `src/router/routes/modules/` 中手写业务路由。**

## 第一步：创建页面组件

在 `src/views/` 下新建 kebab-case 目录（如 `src/views/$page_name/index.vue`），骨架代码：

```html
<script lang="ts" setup>
import GeneralLayout from '@/layout/general-layout.vue'
</script>

<template>
  <general-layout :breadcrumb="['$page_name::page::title']">
    <!-- 页面内容，优先使用 @opentiny/vue 组件 -->
  </general-layout>
</template>
```

规则：
- 布局统一用 `general-layout`，`breadcrumb` 传国际化词条 Key 数组
- 页面独有组件放 `src/views/$page_name/components/`；跨页面复用的才放 `src/components/`
- 接口请求在 `src/api/` 下按域新增/复用文件，不要组件内裸写 axios

## 第二步：创建国际化词条

在后台「系统管理 > 国际化管理」新增词条（若运行时环境提供 `add-i18n-entry` WebMCP 工具则直接调用）：

- Key 格式：`模块::页面::元素`，如 `$page_name::page::title`
- 通过后台界面按语言名称分别创建 zhCN 与 enUS 词条；通过接口或 WebMCP 工具创建前，先查询语言列表并核对当前数据库中的语言 ID。`add-i18n-entry` 工具目前仅接受 `lang=1`（预期 enUS）或 `lang=2`（预期 zhCN），实际映射不符时不要使用该工具，改用后台界面按语言名称创建
- 页面内所有文案都必须走 `$t()`，不允许写死中文

## 第三步：后台菜单管理登记

在后台「系统管理 > 查看菜单」添加菜单（或调用 `add-menu` WebMCP 工具）：

| 字段 | 取值 |
| --- | --- |
| 名称 | 英文标识，对应路由 id，如 `$page_name` |
| 组件 | **不含** `src/views` 前缀，如 `$page_name/index.vue` |
| 路径 | 如 `/$page_name` |
| 国际化 | 第二步创建的词条 Key |
| 优先级 | 数值越大越靠上 |
| 父级菜单 | 需要挂子菜单时填写 |
| 图标 | 必选 |

原理：菜单下发后由 `src/router/guard/menu.ts` 把 `component` 字段映射到 `src/views/**`，组件路径写错会落到内置 404 组件。

## 第四步：角色绑定菜单

> 前提：后端 `PREVIEW_MODE` 必须为 `false`。默认值 `true` 会拒绝角色更新请求；修改后需重启后端服务，再重试绑定。

在后台「系统管理 > 查看角色」中为角色（如 admin）执行「绑定菜单」，勾选新菜单（或调用 `bind-menu-for-role` WebMCP 工具）。未绑定角色的菜单不会出现在左侧导航。

## 可选：按钮级权限

需要控制按钮/元素可见性时：
1. 后台「权限管理」新增权限，名称格式 `模块::操作`（如 `$page_name::add`）
2. 绑定到角色
3. 模板中使用 `<tiny-button v-permission="'$page_name::add'">`

## 验收清单

- [ ] 页面文件位于 `src/views/$page_name/index.vue`，kebab-case 命名
- [ ] 没有改动 `src/router/constant.ts` 或 `src/router/routes/modules/`
- [ ] 中英文词条均已创建，页面无硬编码文案
- [ ] 菜单组件路径与实际文件一致（不含 `src/views` 前缀）
- [ ] 菜单已绑定角色，左侧导航可见、点击可打开
