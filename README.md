# TinyPro
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-7-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

TinyCLI 是一个跨平台的前端工程化 CLI 工具，为开发者提供一系列开发套件及工程插件，覆盖前端开发的整个链路，保证团队开发过程的一致性和可复制性。

TinyPro 是 TinyCLI 的一个套件，是一个开箱即用、前后端分离的后台管理模板。

特性：
- 支持 NestJS / Spring Boot 后端
- 支持通过可视化方式配置菜单
- 细粒度权限管理：角色、用户、菜单、组件权限
- 支持多种构建工具：Webpack / Vite / Rspack / Farm
- 多级菜单
- 页签模式
- Mock 数据
- 主题定制
- 国际化

官网：[https://opentiny.design/vue-pro](https://opentiny.design/vue-pro)
演示站点：[https://opentiny.design/vue-pro/pages](https://opentiny.design/vue-pro/pages)

## 一行命令初始化一个后台管理模板

请确保您安装了`Node.js`、`NPM`、`TinyCLI`。

```bash
tiny init pro
```

选择 Vue 技术栈，初始化完成后，项目结构应该为：

```
tiny-pro
  nestJs    # 后端服务
  web       # 前端服务
```

## 后端启动

后端服务支持 `Docker 启动` 与 `命令启动` 两种方式。

### Docker 启动

请确保您安装了 `Docker`。

在 `tiny-pro/nestJs` 下执行以下命令，启动后端服务：

```bash
docker compose up -d
```

### 命令启动

请确保您安装了 `MySQL`、`Redis`。

在启动项目前请您做好如下检查：

- MySQL 服务可以正常访问
- Redis 服务可以正常访问
- MySQL 中存在 `.env` 文件中 `DATABASE_NAME` 字段定义的数据库，且该数据库为空
- `.env` 文件中 `DATABASE_SYNCHRONIZE` 为 `true`

完成上述检查后，您可以在 `tiny-pro/nestJs` 下执行以下命令，启动后端服务：

```bash
npm i && npm start
```

## 前端启动

在 `tiny-pro/web` 下依次执行以下命令：

- 安装依赖：`npm i`
- 启动前端项目：`npm start`

更详细的文档请参考 TinyPro 官网：[https://opentiny.design/vue-pro](https://opentiny.design/vue-pro)

## 本地启动

如果你有意愿参与本项目的贡献，可以通过以下方式启动前后端（前提是 MySQL/Redis 服务已成功启动），并进行项目开发和调试。

1. 创建一个空的 MySQL 数据库 `demo_tiny_pro`

```shell
# 连接 MySQL 数据库
mysql -u root -p

# 创建 demo_tiny_pro 数据库
create database demo_tiny_pro;

# 查看数据库是否创建成功
show databases;
```

2. 启动 Redis，并配置环境变量

Redis 不需要安装，只需要点击 `redis-server.exe` 即可启动。

在系统环境变量的 Path 中配置 Redis 目录，比如：`C:\Program Files\Redis\`。

验证 Redis 是否连接成功：

在命令行终端输入：

```shell
redis-cli
```

在可交互终端中输入：`ping`，如果 Redis 连接成功的话，应该返回：`PONG`。

```shell
$ redis-cli
127.0.0.1:6379> ping
PONG
```

3. 复制 NestJS 环境变量

```shell
cd template/nestJs
cp .env.example .env
```

4. 安装依赖并启动前后端

```shell
# 安装依赖
pnpm i

# 启动后端，执行该命令之后，会初始化 MySQL 数据库 demo_tiny_pro 的表结构，并填充表数据
pnpm dev:backend

# 启动前端
pnpm dev
```

启动成功之后，会自动打开浏览器，并访问：[http://localhost:3031/](http://localhost:3031/)。

## 维护者

添加官方小助手微信：opentiny-official，加入我们的技术交流群。

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="12.5%"><a href="https://kagol.github.io/blogs"><img src="https://avatars.githubusercontent.com/u/9566362?v=4?s=100" width="100px;" alt="Kagol"/><br /><sub><b>Kagol</b></sub></a><br /><a href="https://github.com/opentiny/tiny-pro/commits?author=kagol" title="Code">💻</a></td>
      <td align="center" valign="top" width="12.5%"><a href="https://github.com/GaoNeng-wWw"><img src="https://avatars.githubusercontent.com/u/31283122?v=4?s=100" width="100px;" alt="GaoNeng"/><br /><sub><b>GaoNeng</b></sub></a><br /><a href="https://github.com/opentiny/tiny-pro/commits?author=GaoNeng-wWw" title="Code">💻</a></td>
      <td align="center" valign="top" width="12.5%"><a href="https://github.com/discreted66"><img src="https://avatars.githubusercontent.com/u/190872652?v=4?s=100" width="100px;" alt="liukun"/><br /><sub><b>liukun</b></sub></a><br /><a href="https://github.com/opentiny/tiny-pro/commits?author=discreted66" title="Code">💻</a></td>
      <td align="center" valign="top" width="12.5%"><a href="https://github.com/hu-qi"><img src="https://avatars.githubusercontent.com/u/17986122?v=4?s=100" width="100px;" alt="huqi"/><br /><sub><b>huqi</b></sub></a><br /><a href="https://github.com/opentiny/tiny-pro/commits?author=hu-qi" title="Code">💻</a></td>
      <td align="center" valign="top" width="12.5%"><a href="https://github.com/Muyu-art"><img src="https://avatars.githubusercontent.com/u/72800755?v=4?s=100" width="100px;" alt="CatWithFish"/><br /><sub><b>CatWithFish</b></sub></a><br /><a href="https://github.com/opentiny/tiny-pro/commits?author=Muyu-art" title="Code">💻</a></td>
      <td align="center" valign="top" width="12.5%"><a href="https://github.com/zzcr"><img src="https://avatars.githubusercontent.com/u/18521562?v=4?s=100" width="100px;" alt="ajaxzheng"/><br /><sub><b>ajaxzheng</b></sub></a><br /><a href="https://github.com/opentiny/tiny-pro/commits?author=zzcr" title="Code">💻</a></td>
      <td align="center" valign="top" width="12.5%"><a href="https://github.com/zhaoxiaofeng876"><img src="https://avatars.githubusercontent.com/u/66005052?v=4?s=100" width="100px;" alt="zhaoxiaofeng876"/><br /><sub><b>zhaoxiaofeng876</b></sub></a><br /><a href="https://github.com/opentiny/tiny-pro/commits?author=zhaoxiaofeng876" title="Code">💻</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!