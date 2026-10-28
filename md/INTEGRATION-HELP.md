# TinyRobot Chat / TinyEditor 可选功能集成方案

本文总结 `tiny init pro` 中"可选功能集成"的完整实现流程与使用说明，涉及两个功能：

- **TinyRobot 智能助手**：基于 `@opentiny/tiny-robot` / `@opentiny/tiny-robot-chat`（`1.0.0-rc.1`）的全局 AI 对话悬浮助手，代码由官方 CLI `@opentiny/tiny-robot-cli@1.0.0-rc.1` 的 `add chat` 命令生成
- **TinyEditor 富文本编辑器**：基于 `@opentiny/fluent-editor` 的表单页富文本能力

两者均由环境变量开关控制显隐（与低代码设计器 `VITE_LOWCODE_DESIGNER_ENABLED` 同一模式），开关由 `tiny init pro` 的多选结果自动改写。


---

## 一、整体架构

```
tiny init pro
  │
  ├─ 交互问询（inquirer checkbox 多选）── src/lib/init.ts getProjectInfo()
  │     问题："请选择需要额外集成的功能（可多选）"
  │
  ├─ 配置改写 ── src/lib/init.ts createProjectSync()
  │     按选择把 dev.env 中 VITE_TINY_ROBOT_ENABLED / VITE_TINY_EDITOR_ENABLED 改写为 true / false
  │     （dev.env 模板默认均为 true，不勾选时改写为 false）
  │
  └─ 模板全量复制（template/tinyvue）── 功能代码始终在模板中，
        由环境变量开关控制显隐
```

**关键设计决策** ：

| 维度 | 本方案（env 开关 + 依赖常驻） |
|---|---|
| 生成项目 | 始终包含功能代码，未选时仅隐藏（不装依赖的裁剪方案会破坏静态 import，复杂且易错） |
| 构建产物 | 功能组件用 `defineAsyncComponent` + `v-if`，未启用时**不打对应 chunk** |
| 一致性 | 与仓库既有低代码设计器模式完全一致 |
| 代价 | 未选功能的依赖也会安装进生成项目 |

### 涉及文件总览

**套件侧（CLI）**

| 文件 | 作用 |
|---|---|
| `src/lib/interfaces.ts` | `FeatureType` 枚举、`FEATURE_OPTIONS` 可扩展清单（含 TinyRobot / TinyEditor 两项） |
| `src/lib/init.ts` | checkbox 问询；`createProjectSync()` 中按多选结果改写 dev.env 开关；NestJS 分支生成 `.env` 自带 `LLM_*` 配置 |

**模板侧（template/tinyvue）**

| 文件 | 作用 |
|---|---|
| `src/tiny-robot-chat/` | TinyRobot 浮动助手（CLI 生成：TinyRobotChat.vue + components/ + composables/ + config/） |
| `src/views/form/base/components/rich-text-item.vue` | TinyEditor 富文本组件 |
| `src/layout/default-layout.vue` | 全局挂载 TinyRobotChat（异步组件 + env 开关） |
| `dev.env` / `src/env.d.ts` | 功能开关及类型声明 |
| `config/vite.config.dev.ts` / `vite.config.prod.ts` | **显式 define 注入**环境变量到 `import.meta.env` |
| `src/mock/robot.ts` | mock 模式下的对话接口（OpenAI 兼容 SSE 演示数据） |
| `package.json` | 依赖 `@opentiny/tiny-robot` / `tiny-robot-chat` / `tiny-robot-kit` / `tiny-robot-svgs`（1.0.0-rc.1）、`@opentiny/fluent-editor` |

**后端代理（template/nestJs）**

| 文件 | 作用 |
|---|---|
| `src/chat/chat.module.ts` / `.controller.ts` / `.service.ts` | `POST /robot/chat/completions` 转发 OpenAI 兼容的 SSE 流式请求 |
| `src/app.module.ts` | 注册 `ChatModule` |
| `src/config-schema.ts` / `.env.example` | `LLM_BASE_URL` / `LLM_API_KEY` / `LLM_MODEL` / `LLM_EXTRA_BODY` |

### 两种运行模式

当前实现同时支持**前端 + mock** 与**前端 + NestJS 后端**两种模式（由 `dev.env` 的 `VITE_USE_MOCK` 切换，`config/dev-proxy.ts` 决定 `/api` 指向 mock 服务还是后端）：

```
模式一：前端 + mock（pnpm dev，VITE_USE_MOCK=true）
  浏览器 TrChat ──POST /api/robot/chat/completions──► mock 服务（src/mock/robot.ts）
                                                        返回 SSE 演示数据，可体验完整交互，但非真实大模型回答

模式二：前端 + NestJS（pnpm -F tiny-pro-vue dev:full，VITE_USE_MOCK=false）
  浏览器 TrChat ──POST /api/robot/chat/completions──► vite dev proxy ──/robot/chat/completions──► NestJS ChatService ──► 大模型服务
  （Authorization: Bearer <登录 JWT>，通过 AuthGuard）            （剥离 /api 前缀）                （服务端 LLM_API_KEY + LLM_EXTRA_BODY 合并，原样回传 SSE 流）
```

要点：

- **Key 不下发**：模式二中前端不接触 `LLM_API_KEY`，浏览器只带登录 JWT，后端用服务端 key 调上游。
- **SSE 流式**：`@opentiny/tiny-robot-chat` 固定以 `stream: true` 请求，mock 与后端都必须返回 `text/event-stream`，不能缓冲整个响应。
- **鉴权复用登录态**：provider 的 `apiKey` 字段填写当前登录 token（`getToken()`），运行时自动加 `Authorization` 头，走全局 `AuthGuard`。

---

## 二、TinyRobot Chat 集成细节

### 2.1 生成与升级方式

`src/tiny-robot-chat/` 不在仓库中手写维护，而是通过 CLI 生成/更新（参考 [CLI 接入文档](https://sonyleo.github.io/tiny-robot/alpha/guide/cli-integration.html)）：

```bash
cd template/tinyvue
npx @opentiny/tiny-robot-cli@1.0.0-rc.1 add chat --runtime-version 1.0.0-rc.1 --yes
```

CLI 会生成/更新 `src/tiny-robot-chat/`、`.env.example` 及依赖（`@opentiny/tiny-robot`、`@opentiny/tiny-robot-chat`、`@opentiny/tiny-robot-kit`、`@opentiny/tiny-robot-svgs`、`@vueuse/core`）。**不会**修改 `main.ts` / `App.vue` / vite 配置，挂载与代理需手动完成。

### 2.2 功能开关与挂载

开关：`dev.env` 的 `VITE_TINY_ROBOT_ENABLED`（模板默认 `true`，`tiny init pro` 会根据多选结果改写；需同步在 `config/vite.config.dev.ts` 和 `vite.config.prod.ts` 的 `define` 中注入，见 2.6）。

挂载点 `src/layout/default-layout.vue`（登录后的主布局）：

```ts
// 检查是否启用 TinyRobot 智能助手
const isTinyRobotEnabled = computed(() => {
  return import.meta.env.VITE_TINY_ROBOT_ENABLED === 'true'
})
// 未启用时不加载智能助手组件对应的 chunk
const TinyRobotChat = defineAsyncComponent(
  () => import('@/tiny-robot-chat/TinyRobotChat.vue'),
)
```

```html
<TinyRobotChat v-if="isTinyRobotEnabled" />
```

样式由 `TinyRobotChat.vue` 内部自行引入，无需在 `main.ts` 重复引入。

### 2.3 前端配置（chat-runtime.ts）

`src/tiny-robot-chat/config/chat-runtime.ts` 中 provider 的定义是联调核心：

```ts
const CHAT_COMPLETIONS_URL = new URL(
  `${import.meta.env.VITE_BASE_API || '/api'}/robot/chat/completions`,
  window.location.origin,
).toString()

export const modelProviders: ChatProviderConfig[] = [
  {
    type: 'qwen',               // 必须是 'openai' | 'deepseek' | 'qwen' 之一
    label: 'TinyRobot 助手',
    apiUrl: CHAT_COMPLETIONS_URL, // 运行时 POST 该地址，固定 stream: true
    apiKey: getToken() ?? '',     // 登录 JWT → Authorization 头
    models: [ /* qwen-plus / qwen-turbo / qwen-max */ ],
  },
]
```

注意：

- `apiUrl` 必须是**绝对 URL**（内部 `new URL()` 解析），且以 `/chat/completions` 结尾（否则会被自动追加）。
- `type` 取值决定内置的 featureBody（qwen 内置 `enable_thinking` / `enable_search` 参数映射，见 2.5）。
- 模型 id 会原样作为 `model` 传给后端/上游，请与 `LLM_MODEL` 所支持的真实模型名保持一致。
- 默认生成的直连 DashScope / DeepSeek 的 provider 配置已移除，统一走 `/api` 代理（mock 或 NestJS）。

### 2.4 mock 模式（前端 + mock）

`src/mock/robot.ts` 注册 `POST /api/robot/chat/completions`，返回 OpenAI 兼容的 SSE 演示数据（`data: {...chunk...}\n\ndata: [DONE]`），并回显用户问题。配套的 `src/mock/server.ts` 已扩展支持自定义响应头与原始文本响应体（`mockHttpResponse(status, body, headers)`），SSE 的 `content-type: text/event-stream` 即依赖该能力。

用途：`pnpm dev`（mock 模式）下可完整体验助手交互（发送、流式渲染、错误提示）；**但回答内容是写死的演示文案，不是真实大模型输出，也不具备联网搜索能力**。真实回答必须走模式二。

### 2.5 联网搜索的实现方式

联网搜索**不是前端能力**，链路如下：

1. 聊天面板上的"联网搜索"开关来自 qwen provider 的 `capabilities: { search: true }`（`@opentiny/tiny-robot-chat` 内置 featureBody：`search.enabled → { enable_search: true }`），开启后请求体自动携带 `enable_search: true`；
2. NestJS `ChatService` 将请求体与 `LLM_EXTRA_BODY` 环境变量合并后转发上游（如通义：`{"enable_search":true,"search_options":{"forced_search":true}}`）；
3. 真正执行联网搜索的是**大模型厂商的服务端**（如通义千问的 enable_search），结果经 SSE 流回前端。

因此：**没有 `LLM_API_KEY`，对话接口根本不可能工作**（`ChatService` 会直接返回 500"服务端未配置 LLM_API_KEY"）。如果你在没配 key 时看到"联网查询"类的输出，只可能是：

- MCP 示例工具（如"查询北京天气"）走的是**浏览器直连公开 MCP 端点**（`modelcontextprotocol-mcp` 经 vite 代理到 modelcontextprotocol.io），获取工具数据不需要 `LLM_API_KEY`，也不经过 NestJS——但把工具结果组织成自然语言回答仍需 LLM，此时会报错；
- 或模型基于训练语料给出的"看似实时"的回答（并非真正联网）。

### 2.6 ⚠️ dev.env 不会自动注入 import.meta.env

**本项目最大的坑**：Vite 只自动加载项目根目录的 `.env` 文件；`dev.env` 需要通过 `configDotenv` 显式读取。目前 `config/vite.config.dev.ts` 和 `config/vite.config.prod.ts` **均已**在开头加载 `dev.env`（prod 不加载会导致 CI 构建时开关取不到值、回退为 false——Robot/Editor 被编译排除）：

```ts
configDotenv({ path: resolve(__dirname, '../dev.env') })
```

注入链：`dev.env`（两开关模板默认均为 `true`）→ `configDotenv` 写入 `process.env` → 各 config 的 `define` 显式注入 `import.meta.env`；CI 环境变量显式设置时优先（dotenv 不覆盖已有变量），`|| 'false'` 兜底仅在变量完全缺失时生效：

```ts
define: {
  'import.meta.env.VITE_TINY_ROBOT_ENABLED': JSON.stringify(
    process.env.VITE_TINY_ROBOT_ENABLED || 'false',
  ),
  // ... 其余开关同理
}
```

---

## 三、TinyEditor 集成细节

- 组件：`template/tinyvue/src/views/form/base/components/rich-text-item.vue`

```ts
import TinyEditor from '@opentiny/fluent-editor'
import '@opentiny/fluent-editor/style.css'

onMounted(() => {
  _editor = new TinyEditor(editorRef.value, { theme: 'snow' })
})
```

- 集成点：`base-info.vue`（基础表单页，`/vue-pro/form/base`）底部"富文本说明"表单项，用 `defineAsyncComponent` + `v-if="import.meta.env.VITE_TINY_EDITOR_ENABLED === 'true'"` 控制——与 TinyRobot 的挂载方式（2.2 节）完全一致，同样受 `tiny init pro` 多选开关控制（`VITE_TINY_EDITOR_ENABLED`）。

---

## 四、使用说明

### 4.1 两种模式的选择

| 场景 | 命令 | 说明 |
|---|---|---|
| 纯前端演示 / 无后端环境 | `pnpm dev`（根目录）或 `pnpm -F tiny-pro-vue start` | mock 模式；助手返回 SSE 演示数据，可体验交互，非真实回答 |
| 真实对话 / 联调 | `pnpm -F tinyui-nestjs-server start` + `pnpm -F tiny-pro-vue dev:full` | 后端模式；返回真实大模型流式回答，可配联网搜索 |

前提：`VITE_TINY_ROBOT_ENABLED=true`（模板默认开启；开关改动需重启 dev server + 硬性刷新 `Ctrl+Shift+R`）。

### 4.2 配置大模型（联网搜索，模式二）

1. 后端：复制 `template/nestJs/.env.example` 为 `.env`，填入 `LLM_API_KEY`（`sk-` 开头，[百炼平台](https://bailian.console.aliyun.com/cn-beijing/model/settings/api-key) 申请）；
2. （可选）`LLM_EXTRA_BODY={"enable_search":true,"search_options":{"forced_search":true}}` 强化联网搜索；
3. **重启后端**（`.env` 只在进程启动时读入内存）+ 重启前端；
4. 登录后点击右下角 AI 悬浮按钮发送问题；Network 中 `POST /api/robot/chat/completions` 返回 `200` 且为 `text/event-stream`，气泡逐字输出即联调成功。

其他可选服务：DeepSeek（`LLM_BASE_URL=https://api.deepseek.com`，`LLM_MODEL=deepseek-chat`））。

### 4.3 验证后端代理是否生效（填了 LLM_API_KEY 后）

按优先级选择以下任一种方式：

**方式一：单测（无需真实 key / MySQL / Redis，推荐先做）**

```bash
pnpm -F tinyui-nestjs-server test -- src/chat
```

`src/chat/__tests__/chat.service.spec.ts` 用本地 stub 上游验证代理行为：转发地址 `/chat/completions`、带 `Bearer <LLM_API_KEY>` 鉴权头、`LLM_EXTRA_BODY` 与请求体合并、SSE 原样透传、缺 key 抛 500、上游 401 包装为 502。4 个用例全过即说明代理逻辑正确。

**方式二：curl 直连后端接口（需要启动完整后端）**

```bash
# 1. 启动依赖（MySQL / Redis）
docker compose -f template/nestJs/docker-compose.yml up -d mysql redis
# 2. 配置 key
cp template/nestJs/.env.example template/nestJs/.env
# 编辑 .env 填入 LLM_API_KEY，按需调整 LLM_BASE_URL / LLM_MODEL / LLM_EXTRA_BODY
# 3. 启动后端（首次启动自动建表 + 种子数据；种子账号邮箱 admin@no-reply.com，密码 admin）
pnpm dev:backend
# 4. 登录拿 token（种子账号 admin@no-reply.com / admin），再调对话接口
curl -s -X POST http://127.0.0.1:3000/auth/login -H "Content-Type: application/json" \
  -d '{"email":"admin@no-reply.com","password":"admin"}'
curl -N -X POST http://127.0.0.1:3000/robot/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <上一步返回的 accessToken>" \
  -d '{"model":"qwen-plus","messages":[{"role":"user","content":"用一句话介绍你自己"}],"stream":true}'
```

`-N` 关闭 curl 缓冲；返回 `200` + `text/event-stream` 且逐行输出 `data: {...}` 即为代理生效（401 说明 token 失效，500 说明后端没配 key，502 说明上游 key/地址有问题）。

**方式三：页面端到端**

`pnpm dev:backend` + `pnpm -F tiny-pro-vue dev:full`，浏览器登录后点 AI 悬浮按钮发消息；Network 面板观察 `POST /api/robot/chat/completions`：状态 200、`content-type: text/event-stream`、响应逐字增长，即"发送问题 → 走后端代理 → 大模型"全链路打通。

### 4.4 验证清单

```bash
pnpm build                          # 套件 tsc 编译
npx tslint --project .              # 套件 tslint
pnpm -F tiny-pro-vue lint           # 模板 eslint
pnpm -F tiny-pro-vue build          # 模板生产构建
pnpm -F tiny-pro-vue test:mock      # mock 服务单测（含 SSE 对话路由）
pnpm -F tinyui-nestjs-server build  # 后端编译
pnpm -F tinyui-nestjs-server test   # 后端单测
```

功能冒烟：开关 `true` 时页面右下角出现 AI 悬浮按钮、基础表单页出现富文本；开关 `false` 时消失且 Network 中无对应 chunk 请求。mock 模式下发送消息应收到 `[Mock 模式]` 开头的演示回答。

---

## 五、常见问题（FAQ）

| 现象 | 原因 | 解决 |
|---|---|---|
| 发送后报错 `HTTP 401` | 登录态失效，provider 的 `apiKey` 是初始化时读取的旧 token | 重新登录；或刷新页面后重试 |
| 发送后报错 `HTTP 500 服务端未配置 LLM_API_KEY` | 模式二后端 `.env` 没配 `LLM_*` | 配好后**重启后端**；或先用 mock 模式体验（`pnpm dev`） |
| 发送后报错 `HTTP 502` | 上游大模型返回错误（多为 key 无效 401），被包装为 502 | 看气泡里的具体错误；key 要匹配 `LLM_BASE_URL` 对应平台 |
| 某个模型能用、切其他模型报 502（`limit_requests`） | **上游按模型独立限流/配额**：通义千问的 RPM/TPM 配额按模型分别计算，某模型配额打满时仅该模型报 `You have exceeded your current request limit`，且错误经后端原样透出为 502 | 换可用模型；稍后重试（瞬时限流会自动恢复）；到百炼控制台查看/提升该 key 的各模型配额。可用 curl 直连 `${LLM_BASE_URL}/chat/completions` 绕过本项目代码复现确认（见 4.3 方式二） |
| 想减少可选模型数量 | 聊天面板模型列表来自 `src/tiny-robot-chat/config/chat-runtime.ts` 的 `models` 配置 | 删除账号不可用的模型项即可 |
| mock 模式下回答总是"[Mock 模式]…" | 这是设计行为：mock 只返回演示数据 | 需要真实回答请走模式二（见 4.1） |
| 功能开关改了不生效 | `dev.env` 只在启动时读取 | 重启 dev server + `Ctrl+Shift+R` 硬性刷新 |
| `import.meta.env.XXX` 为 `undefined` | 新变量没加 vite define 注入 | 见 2.6 节 |
| 对话无流式输出、一直转圈 | 后端/网关缓冲了 SSE（如 nginx 未关闭缓冲） | 后端已设 `X-Accel-Buffering: no`；nginx 加 `proxy_buffering off` |
| 模型答不了天气等实时问题 | 模型本身无联网能力 | 聊天面板打开"联网搜索"开关 + 后端配 `LLM_EXTRA_BODY`（见 2.5） |
| MCP 示例工具能用但组织不了回答 | 工具数据来自公开 MCP 端点（无需 key），回答仍需 LLM | 配置模式二 + `LLM_API_KEY` |
| 后端模式下所有接口都 404（不只对话） | 后端 `.env` 缺少 `GLOBAL_PREFIX=/`（`main.ts` 缺省前缀为 `/api`，而 vite dev proxy 会剥掉 `/api`，两者必须配套） | `.env` 补 `GLOBAL_PREFIX=/` 后重启后端 |
| 改了 `nestJs/.env` 不生效 | 进程启动时读入内存 | 重启后端 |
| **key 泄露风险** | `LLM_API_KEY` 只能出现在后端 `.env`（已被 gitignore），禁止写入任何会提交的前端文件 | 已泄露的 key 立即吊销 |

---

## 六、如何新增第三个可选功能

1. `src/lib/interfaces.ts` 的 `FeatureType` 枚举加值，`FEATURE_OPTIONS` 数组加一项（`name` / `value` / `envKey` 三元组）；
2. `template/tinyvue/dev.env` 加 `VITE_XXX_ENABLED=false` 占位，`src/env.d.ts` 加声明；
3. `config/vite.config.dev.ts` 和 `vite.config.prod.ts` 的 `define` 中补注入（见 2.6）；
4. 模板中实现功能组件，用 `defineAsyncComponent` + `v-if` env 开关挂载；
5. 若带依赖，加入 `template/tinyvue/package.json`。

完成以上后，`tiny init pro` 的多选问题会自动出现新选项，无需改 `init.ts` 的问询与 env 改写逻辑（`FEATURE_OPTIONS` 驱动；改写规则为把 `VITE_XXX_ENABLED=(true|false)` 替换为按选择写入的 `true`/`false`）。
