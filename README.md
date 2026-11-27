# TinyPro
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-8-orange.svg?style=flat-square)](#contributors-)
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

## TinyCLI一行命令————初始化一个后台管理模板

请确保您安装了`Node.js`、`NPM`、`TinyCLI`。

官方推荐用 npm 安装 TinyCLI：

```bash
npm install @opentiny/cli -g
tiny -v
```

查看是否安装成功：

```bash
tiny -v
```

使用 tiny init 命令，创建pro项目：
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

### Docker 启动（方式一）

请确保您安装了 `Docker`。

在 `tiny-pro/nestJs` 下执行以下命令，启动后端服务：

```bash
docker compose up -d
```

### 命令启动（方式二）

请确保您安装了 `MySQL`、`Redis`。

在启动项目前请您做好如下检查：

- MySQL 服务可以正常访问
- Redis 服务可以正常访问
- MySQL 中存在 `.env` 文件中 `DATABASE_NAME` 字段定义的数据库，且该数据库为空
- `.env` 文件中 `DATABASE_SYNCHRONIZE` 为 `true`

更详细的文档请参考 TinyPro 官网：[https://opentiny.design/vue-pro](https://opentiny.design/vue-pro)

## 本地项目启动运行

如果你有意愿参与本项目的贡献，可以通过以下方式启动项目。共三种模式，按是否需要 MySQL / Redis 选择：

> 以下以 pnpm 为例；npm 用户请注意：根目录使用 pnpm workspace，npm 无法使用根目录脚本，请进入对应子项目目录执行（命令见各模式末尾的 npm 等价命令）。

### 模式一：纯前端 Mock（无需 MySQL / Redis，推荐快速体验）
Mock 服务和前端都由 tinyvue 提供，无需启动任何后端：

```shell
pnpm i
pnpm dev
```

`pnpm dev` 会同时启动 Mock 服务（8848）与 Vite 开发服务。启动成功之后，会自动打开浏览器，并访问：[http://localhost:3031/](http://localhost:3031/)。

npm 等价命令：

```shell
cd template/tinyvue
npm i
npm run start:mock
```

### 模式二：NestJS Mock 联调（无需 MySQL / Redis）

NestJS 以 `MOCK_MODE=true` 启动，只加载 mock 能力：演示接口、登录、用户信息、角色权限、菜单、国际化、系统管理页的增删改查全部由 NestJS 内存 mock 数据接管（数据定义在 `template/nestJs/src/mock/data/`），适合联调后端接口形态或调试前端页面。

```shell
pnpm i

# 终端 1：启动 NestJS mock 服务
pnpm nest:mock

# 终端 2：启动前端
pnpm dev:vite
```

访问 [http://localhost:3031/](http://localhost:3031/)，账号 `admin@no-reply.com` / `admin`。修改 `template/nestJs/src/mock/data/` 下的数据文件会热更新，重启服务后还原。

npm 等价命令：

```shell
# 终端 1
cd template/nestJs
npm i
npm run start:mock

# 终端 2
cd template/tinyvue
npm i
npm run dev
```

### 模式三：真实数据库联调（需要 MySQL / Redis）

演示接口走真实业务路由，数据来自 MySQL。

前提是 MySQL / Redis 服务已成功启动。

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

3. 配置后端环境变量

```shell
cp template/nestJs/.env.example template/nestJs/.env
```

编辑 `template/nestJs/.env`，根据本机 MySQL 配置填写 `DATABASE_HOST`、`DATABASE_PORT`、`DATABASE_USERNAME`、`DATABASE_PASSWORD` 和 `DATABASE_NAME`。

4. 安装依赖并启动前后端

```shell
# 安装依赖
pnpm i

# 启动后端，执行该命令之后，会初始化 MySQL 数据库 demo_tiny_pro 的表结构，并填充表数据
pnpm dev:backend

# 启动前端
pnpm dev:vite
```

启动成功之后，会自动打开浏览器，并访问：[http://localhost:3031/](http://localhost:3031/)。

npm 等价命令：

```shell
# 终端 1
cd template/nestJs
npm i
npm start

# 终端 2（dev.env 中 VITE_USE_MOCK 默认为 false，直接 dev 即代理到真实后端）
cd template/tinyvue
npm i
npm run dev
```

> 说明：三种模式下前端请求形式不变（均为 `/api/**`）。模式二、三的区别在于 NestJS 的启动方式（`pnpm nest:mock` 或 `pnpm dev:backend`），由后端决定演示接口的数据来源（内存 mock 或 MySQL）。

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
      <td align="center" valign="top" width="12.5%"><a href="https://blog.vaebe.cn/"><img src="https://avatars.githubusercontent.com/u/52314078?v=4?s=100" width="100px;" alt="vae"/><br /><sub><b>vae</b></sub></a><br /><a href="https://github.com/opentiny/tiny-pro/commits?author=vaebe" title="Code">💻</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!

## Spring Boot 后端启动

Spring Boot 后端位于 `template/springboot`，启动类为
`com.TinyPro.TinyProApplication`，默认监听 `3000` 端口。

### 环境准备

本地启动前请准备：

- JDK 17
- Maven 3.9+，并确保 `mvn` 已加入 PATH
- MySQL 8.x，默认端口 `3306`
- Redis 7.x，默认端口 `6379`
- 可选的 LLM 服务 API Key（仅调用 AI 对话接口时需要）

使用 Docker 启动时，只需要准备 Docker Engine 和 Docker Compose，不需要在本机单独安装 Java、Maven、MySQL 或 Redis。

### 本地启动

#### 1. 创建 MySQL 数据库

创建一个空数据库：

```sql
CREATE DATABASE tinypro_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

数据库名称需要与 `template/springboot/src/main/resources/application-local.properties` 中的连接地址一致。

#### 2. 启动 Redis

```bash
redis-cli ping
```

正常返回 `PONG`。

#### 3. 配置环境变量

`application-local.properties` 使用以下环境变量：

| 环境变量 | 是否必需 | 说明 |
| --- | --- | --- |
| `MYSQL_USERNAME` | 是 | MySQL 用户名 |
| `MYSQL_PASSWORD` | 是 | MySQL 密码 |
| `REDIS_HOST` | 是 | Redis 地址，本机通常为 `localhost` |
| `REDIS_PASSWORD` | 否 | Redis 密码，无密码时留空 |
| `JWT_SECRET` | 是 | JWT 签名密钥，至少 8 个字符 |
| `LLM_API_KEY` | 使用 AI 时必需 | 服务端调用大模型的 API Key |
| `LLM_BASE_URL` | 否 | OpenAI 兼容接口地址，默认通义千问兼容地址 |
| `LLM_MODEL` | 否 | 默认模型，默认值为 `qwen-plus` |
| `LLM_EXTRA_BODY` | 否 | 发送给模型服务的额外 JSON 参数 |
| `GLOBAL_PREFIX` | 否 | API 前缀，默认 `/`；可设置为 `/api` |
| `ENABLE_SWAGGER` | 否 | 是否启用 Swagger，默认 `false` |
| `FLYWAY_ENABLED` | 否 | 是否启用数据库迁移，默认 `true` |

PowerShell：

```powershell
$env:MYSQL_USERNAME = "root"
$env:MYSQL_PASSWORD = "你的MySQL密码"
$env:REDIS_HOST = "localhost"
$env:REDIS_PASSWORD = ""
$env:JWT_SECRET = "change-this-jwt-secret"

# 使用 AI 对话接口时配置
$env:LLM_API_KEY = "你的LLM_API_KEY"
$env:LLM_BASE_URL = "https://dashscope.aliyuncs.com/compatible-mode/v1"
$env:LLM_MODEL = "qwen-plus"
```

Linux/macOS：

```bash
export MYSQL_USERNAME=root
export MYSQL_PASSWORD='你的MySQL密码'
export REDIS_HOST=localhost
export REDIS_PASSWORD=''
export JWT_SECRET='change-this-jwt-secret'

# 使用 AI 对话接口时配置
export LLM_API_KEY='你的LLM_API_KEY'
export LLM_BASE_URL='https://dashscope.aliyuncs.com/compatible-mode/v1'
export LLM_MODEL='qwen-plus'
```

#### 4. 启动 Spring Boot

```bash
cd template/springboot
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

也可以先打包再运行：

```bash
cd template/springboot
mvn clean package -DskipTests
java -jar target/SpringBoot-1.0-SNAPSHOT.jar
```

启动时 Flyway 会执行 `src/main/resources/db/migration` 下的迁移，
然后由 `DataInitializer` 初始化权限、菜单、语言、应用和编辑器数据。
首次使用空数据库时会创建默认管理员：

```text
邮箱：admin@no-reply.com
密码：admin
```

首次登录后请立即修改密码。已有数据的数据库不会因为重启而自动重新创建默认管理员。

### Docker Compose 启动

`template/springboot/docker-compose.yml` 会启动 Spring Boot、MySQL 8 和 Redis 7：

```bash
cd template/springboot
docker compose up -d --build
```

查看日志：

```bash
docker compose logs -f app
```

停止服务：

```bash
docker compose down
```

默认配置：

```text
MySQL 地址：mysql:3306
MySQL 数据库：tinypro_db
MySQL 用户：root
MySQL 密码：123456
Redis 地址：redis:6379
应用地址：http://localhost:3000
```

生产或共享环境不要直接使用默认密码。启动前应修改
`template/springboot/docker-compose.yml` 中的数据库密码和 `JWT_SECRET`。
使用 AI 对话接口时，还需要在 Compose 的 `app.environment` 中增加：

```yaml
LLM_API_KEY: your-llm-api-key
LLM_BASE_URL: https://dashscope.aliyuncs.com/compatible-mode/v1
LLM_MODEL: qwen-plus
```

### 验证后端是否启动成功

默认健康检查：

```bash
curl http://localhost:3000/healthCheck
```

正常返回 `success`。Actuator 健康检查地址为：

`http://localhost:3000/actuator/health`

启用 Swagger：

```powershell
$env:ENABLE_SWAGGER = "true"
```

然后访问：

```text
http://localhost:3000/swagger-ui.html
http://localhost:3000/v3/api-docs
```

登录接口默认是：

```text
POST http://localhost:3000/auth/login
```

如果配置 `GLOBAL_PREFIX=/api`，业务接口会变为
`http://localhost:3000/api/auth/login`；健康检查仍为
`http://localhost:3000/healthCheck`。

### 与前端联调

前端开发环境默认把 `/api` 请求代理到 `http://127.0.0.1:3000`，
并在转发到 Spring Boot 时去掉 `/api` 前缀。因此本地联调时后端保持
`GLOBAL_PREFIX=/` 即可。

```bash
# 终端 1：启动后端
cd template/springboot
mvn spring-boot:run -Dspring-boot.run.profiles=local

# 终端 2：启动前端
cd template/tinyvue
pnpm install
pnpm dev
```

### Flyway 注意事项

- 新数据库可以直接启动，Flyway 会按版本顺序执行 `V1__...` 到最新迁移。
- 已有非空数据库请先备份并核对表、字段、索引和约束，不要直接开启迁移。
- 已执行的迁移文件不要修改；后续结构变化应新增更高版本的迁移文件。
- `FLYWAY_BASELINE_ON_MIGRATE` 默认是 `false`。已有数据库需要 baseline
  时，请先阅读 `template/springboot/FLYWAY.md`。
- Hibernate 使用 `ddl-auto=validate`，只校验实体和数据库结构，不负责修改表结构。

### 常见问题

1. **JWT secret 为空或长度不足**

   检查 `JWT_SECRET` 是否已设置，且长度至少为 8 个字符。

2. **无法连接 MySQL**

   检查 MySQL 是否启动、`tinypro_db` 是否已创建，以及
   `MYSQL_USERNAME`、`MYSQL_PASSWORD` 是否正确。

3. **无法连接 Redis**

   检查 `REDIS_HOST`、端口 `6379` 和 `REDIS_PASSWORD` 是否正确。

4. **AI 接口提示未配置 API Key**

   配置 `LLM_API_KEY`。普通业务接口不依赖该配置，AI 对话接口依赖它。

5. **前端请求 404**

   本地联调时确认后端监听 `3000`，并保持默认 `GLOBAL_PREFIX=/`；
   如果设置了 `GLOBAL_PREFIX=/api`，前端代理配置也需要同步调整。
