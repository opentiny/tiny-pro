---
name: tiny-pro-operator
description: TinyPro 项目的前端页面操作指南。当用户需要新建页面、配置菜单、设置权限（v-permission）、国际化（i18n）管理或进行 TinyPro 相关页面的操作时触发。该技能提供从菜单管理、词条管理、用户管理、权限管理的完整指引。
---

# TinyPro 操作指南 (tiny-pro-operator)

本技能旨在帮助开发者在 TinyPro 框架下高效地完成页面操作，比如：菜单管理、权限管理和国际化配置。

## 1. 核心流程：新建页面与菜单绑定

当用户希望在 TinyPro 中增加一个新页面时，请遵循以下四个步骤：

### 第一步：创建目录与文件

在 `web/src/views` 下新建页面目录，并包含 `index.vue`。

- **目录结构示例**：`web/src/views/test-page/index.vue`
- **代码规范**：
  - 使用 `<script setup lang="ts">`。
  - 使用 `GeneralLayout` 作为页面顶层布局。
  - 引用 `@opentiny/vue` 组件。

```vue
<script lang="ts" setup>
import { TinyButton } from '@opentiny/vue'
import { computed, ref } from 'vue'
import GeneralLayout from '@/layout/general-layout.vue'
import { useUserStore } from '@/store'

const count = ref(0)
const incr = () => count.value++
const userStore = useUserStore()
const userName = computed(() => userStore.name)
</script>

<template>
  <general-layout :breadcrumb="['test::page::title']">
    <h1> Hi {{ userName }} !</h1>
    <tiny-button @click="incr">Click me</tiny-button>
    <p>Count: {{ count }}</p>
  </general-layout>
</template>
```

### 第二步：国际化词条管理

请切换到 locale 路由，并调用 add-i18n-entry 工具完成词条添加。

1. 访问 `系统管理 > 国际化管理`。
2. 添加词条：
   - **词条Key**：如 `test::page::title`。
   - **词条内容**：如 `测试页面`。
   - **语言**：选择 `zhCN`。

### 第三步：菜单配置

请切换到 menu/allMenu 路由，并调用 add-menu 工具完成菜单添加。

1. 访问 `系统管理 > 查看菜单`。
2. 添加菜单：
   - **名称**：路由的 ID。
   - **图标**：必选图标。
   - **组件**：填写相对于 `src/views` 的路径（如 `test-page/index.vue`）。
   - **国际化**：关联之前创建的词条 Key。

### 第四步：角色授权

请切换到 role/allRole 路由，并调用 bind-menu-for-role 工具完成角色授权。

1. 访问 `系统管理 > 查看角色`。
2. 点击 `绑定菜单`，将新菜单勾选给对应角色（如 `admin`）。

---

## 2. 权限管理 (v-permission)

当需要对特定组件或元素进行权限控制时，请按以下步骤操作：

### 权限配置流

1. **新增权限**：在 `系统管理 > 查看权限` 中定义权限标识（如 `test::page::double::text`）。
2. **分配权限**：在 `角色管理` 中将权限绑定给目标角色。注意：测试时可故意不绑定某角色以验证不可见。
3. **代码实施**：在 Vue 模板中使用 `v-permission` 指令。

```vue
<template>
  <!-- 只有拥有该权限的用户才能看到此元素 -->
  <p v-permission="'test::page::double::text'">
    敏感信息：{{ sensitiveData }}
  </p>
</template>
```

---

## 3. 其他系统管理功能

以下是系统管理包含的功能，每个功能都有对应的路由和 MCP 工具。

- 菜单管理（路由：`menu/allMenu`）：
  - ✅️创建菜单 `add-menu`
  - ❌修改菜单
  - ❌删除菜单
- 权限管理（路由：`permission/allPermission`）：
  - ✅️添加权限 `add-permission`
  - ❌编辑权限
  - ❌删除权限
- 角色管理（路由：`role/allRole`）：
  - ✅️添加角色 `add-role`
  - ❌编辑角色（名称、权限）
  - ❌删除角色
  - ✅️绑定目录 bind-menu-for-role
- 用户管理（路由：`userManager/allInfo`）：
  - ✅️添加用户 `add-user`
  - ❌编辑用户
  - ❌修改密码
  - ❌删除用户（包含批量删除用户）
- 国际化词条管理（路由：`locale`）：
  - ✅️添加词条 `add-i18n-entry`
  - ❌删除词条（包含批量删除词条）

## 4. 触发场景示例

- "我想在项目中添加一个新页面，名字叫 'UserReports'。"
- "如何给一个按钮添加权限控制？"
- "我新建了页面，但是左侧菜单里没有显示。"
- "怎么在 TinyPro 里获取当前登录的用户名？"
