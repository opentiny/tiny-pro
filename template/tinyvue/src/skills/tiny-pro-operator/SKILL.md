---
name: tiny-pro-operator
description: TinyPro 项目的前端页面操作指南。当用户需要新建页面、配置菜单、设置权限（v-permission）、国际化（i18n）管理或进行 TinyPro 相关页面的操作时触发。该技能提供从菜单管理、词条管理、用户管理、权限管理的完整指引。
---

# TinyPro 操作指南 (tiny-pro-operator)

本技能旨在帮助开发者在 TinyPro 框架下高效地完成页面操作，比如：菜单管理、权限管理和国际化配置。

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

当用户询问相关操作时，需要跳转到对应的路由，调用对应的 MCP 工具。

例如：“帮我添加权限：good::add，描述是：创建商品”，则需要调用 MCP 工具 `add-permission`。
