# TinyPro Nest.js

## 说明

此项目为 tiny-toolkit-pro 套件初始化的 TinyPro 的 Nest.js 后端项目。

## 快速上手

### 依赖安装

您可以选择任何您喜欢的包管理工具, 这里使用了 npm

```
npm install
```

### 开发环境启动

在启动开发环境时, 请确保本机已经启动了 `MySQL` 与 `Redis` 服务。并已经做好了如下检查

1. 启动了 `MySQL` 服务
2. `MySQL` 服务可以访问
3. 启动了 `Redis` 服务
4. `Redis` 服务可以正常访问
5. `.env`文件中 `DATABASE_HOST` 配置项是 `MySQL` 服务的 IP 地址
6. `.env`文件中 `DATABASE_PORT` 配置项是 `MySQL` 服务的端口号
7. `.env`文件中 `DATABASE_NAME` 配置项指明的数据库存在
8. `.env`文件中 `DATABASE_SYNCHRONIZE` 为 `true`
9. `.env`文件中 `DATABASE_USERNAME` 指明的用户存在且拥有对 `DATABASE_NAME` 配置项指明的数据库有增加、删除、修改、查询权限
10. `.env`文件中 `DATABASE_AUTOLOADENTITIES` 为 `true`
11. `.env`文件中 `REDIS_HOST` 为 `Redis` 服务 IP
12. `.env`文件中 `REDIS_PORT` 为 `Redis` 服务端口号
13. 依赖安装完成

### Docker启动

在使用 docker 环境时, 您应当确保机器已经安装了 Docker 服务. 本章仅阐述项目默认的 `docker-compose.yaml` 文件的启动注意事项

1. 您的 `docker` 服务安装成功
2. `.env` 文件中 `DATABASE_PASSWORD` 与 `services.mysql.environment.MYSQL_ROOT_PASSWORD` 是一致的 (如果 `.env` 文件中 `DATABASE_USERNAME` **不为** root 可以忽略此检查)
2. `.env` 文件中 `DATABASE_PASSWORD` 与 `services.mysql.environment.MYSQL_PASSWORD` 是一致的 (如果 `.env` 文件中 `DATABASE_USERNAME` 为 root 可以忽略此检查)
3. `.env` 文件中 `DATABASE_USERNAME` 与 `services.mysql.environment.MYSQL_USER` 是一致的 (如果 `.env` 文件中 `DATABASE_USERNAME` 为 root 可以忽略此检查)
4. `services.mysql.environment.MYSQL_DATABASE` 与 `.env` 文件中 `DATABASE_NAME` 是一致的
5. `.env`文件中 `DATABASE_SYNCHRONIZE` 为 `true`
6. `.env`文件中 `DATABASE_HOST` 为 `mysql`
7. `.env`文件中 `REDIS_HOST` 为 `redis`

完成上述检查后, 您可以使用 `docker compose up -d` 来运行 docker 环境

### 联调模式说明

演示页面接口（看板 `/user/getdata`、表单 `/base/getdata`、员工 `/employee/*`、项目 `/project/*` 等）有两种联调方式:

- `pnpm start:dev`（默认）: 需要 MySQL 与 Redis。演示接口走真实业务路由, 数据来自 MySQL（如员工列表查 `employee` 表）
- `pnpm start:mock`: **不需要 MySQL 与 Redis**。启用 `MOCK_MODE=true`, 应用只加载 mock 能力：演示接口、登录、用户信息、角色权限、菜单、国际化全部由内存 mock 数据接管（数据定义在 `src/mock/data/`）, 前端可直接完成登录并调试演示页面

两种方式下前端请求形式不变（均为 `/api/**`）, 由后端启动方式决定数据来源。注意: 未建表的演示接口（看板、表单选项、项目等）在非 mock 模式下没有真实路由, 无法访问。


## 二次开发指南

// WAITING FOR DOCUMENT DEPLOY
// SHOULD LINK TO tiny-pro-backend-dev-guideline.md

## 遇到困难?

加官方小助手微信 opentiny-official，加入技术交流群
