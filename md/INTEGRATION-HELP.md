# TinyRobot / TinyEditor 可选功能集成方案

本文总结 `tiny init pro` 中"可选功能集成"的完整实现流程与使用说明，涉及两个首批功能：

- **TinyRobot 智能助手**：基于 `@opentiny/tiny-robot` 的全局 AI 对话悬浮助手
- **TinyEditor 富文本编辑器**：基于 `@opentiny/fluent-editor` 的表单页富文本能力

> 功能清单设计为**可扩展**，后续新增功能只需改动两处（见文末"如何新增功能"）。

---

## 一、整体架构

```
tiny init pro
  │
  ├─ 交互问询（inquirer checkbox 多选）── src/lib/init.ts getProjectInfo()
  │     新增问题："请选择需要额外集成的功能（可多选）"
  │
  ├─ 配置改写 ── src/lib/init.ts createProjectSync()
  │     按选择把 dev.env 中 VITE_XXX_ENABLED=false 改写为 true
  │
  └─ 模板全量复制（template/tinyvue）── 功能代码始终在模板中，
        由环境变量开关控制显隐（与低代码设计器 VITE_LOWCODE_DESIGNER_ENABLED 同一模式）
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
| `src/lib/interfaces.ts` | `FeatureType` 枚举、`FEATURE_OPTIONS` 可扩展清单、`ProjectInfo.features` 字段 |
| `src/lib/init.ts` | checkbox 问询；`createProjectSync()` 中按多选结果改写 dev.env 开关；NestJS 分支生成 `.env` 自带 `LLM_*` 配置 |

**模板侧（template/tinyvue）**

| 文件 | 作用 |
|---|---|
| `src/components/tiny-robot/index.vue` | TinyRobot 浮动助手组件（新建） |
| `src/views/form/base/components/rich-text-item.vue` | TinyEditor 富文本组件（新建） |
| `src/views/form/base/components/base-info.vue` | 基础表单页集成富文本表单项 |
| `src/layout/default-layout.vue` | 全局挂载 TinyRobot（异步组件 + env 开关） |
| `src/api/robot.ts` | 大模型调用封装：proxy / direct 两种模式 + EXTRA_BODY 透传 |
| `dev.env` / `src/env.d.ts` | 开关与 LLM 配置项及类型声明 |
| `config/vite.config.dev.ts` / `vite.config.prod.ts` | **显式 define 注入**环境变量到 `import.meta.env` |
| `package.json` | 新增依赖 `@opentiny/tiny-robot ^0.5.1`、`@opentiny/fluent-editor ^3.25.4` |

**后端代理（template/nestJs）**

| 文件 | 作用 |
|---|---|
| `src/robot/robot.module.ts` / `.controller.ts` / `.service.ts` | `POST /robot/chat` 转发 OpenAI 兼容请求（新建） |
| `src/app.module.ts` | 注册 `RobotModule` |
| `src/config-schema.ts` / `.env.example` | `LLM_BASE_URL` / `LLM_API_KEY` / `LLM_MODEL` / `LLM_EXTRA_BODY` |

---

## 二、TinyRobot 集成细节

### 2.1 组件与挂载

- 组件：`template/tinyvue/src/components/tiny-robot/index.vue`
  - 右下角浮动"AI"按钮，点击展开对话面板
  - 对话区 `@opentiny/tiny-robot` 的 `TrBubbleList` + `TrSender`（需引入 `@opentiny/tiny-robot/dist/style.css`）
  - 提交后先插入 `loading` 占位气泡，成功后填入回复，失败显示错误信息；请求中输入框禁用
- 挂载点：`template/tinyvue/src/layout/default-layout.vue`

```ts
// 检查是否启用 TinyRobot 智能助手
const isTinyRobotEnabled = computed(() => {
  return import.meta.env.VITE_TINY_ROBOT_ENABLED === 'true'
})
// 未启用时不加载智能助手组件对应的 chunk
const TinyRobot = defineAsyncComponent(
  () => import('@/components/tiny-robot/index.vue'),
)
```

### 2.2 ⚠️ tiny-robot 0.5.x 破坏性变更

`@opentiny/tiny-robot` 从 0.3.0 升级到 0.5.x 时有破坏性 API 变更（Sender 重写为 tiptap 实现）：

| 变更点 | 0.3.0 | 0.5.x |
|---|---|---|
| 消息列表 prop | `items` | **`messages`**（`BubbleMessage[]`） |
| 角色名惯例 | 任意（如 `'ai'`） | 默认 `fallbackRole` 为 `'assistant'` |
| 消息 id 类型 | 无要求 | `id?: string` |

`TrSender` 的 `v-model` / `placeholder` / `clearable` / `@submit` 与 CSS 路径 `dist/style.css` 均未变。

### 2.3 大模型接入（proxy / direct 可切换）

配置项（`template/tinyvue/dev.env`）：

| 配置项 | 说明 | 默认值 |
|---|---|---|
| `VITE_ROBOT_LLM_MODE` | `proxy`=走后端代理（key 在服务端，**推荐**）；`direct`=前端直连（key 暴露给浏览器，仅内网/demo） | `proxy` |
| `VITE_ROBOT_LLM_BASE_URL` | OpenAI 兼容服务地址 | `https://api.deepseek.com` |
| `VITE_ROBOT_LLM_API_KEY` | API key（direct 模式使用；proxy 模式以前端不读） | 空 |
| `VITE_ROBOT_LLM_MODEL` | 当前设置模型名 |`qwen-plus`| 默认模型名 | `deepseek-chat` |
| `VITE_ROBOT_LLM_PROXY_URL` | proxy 模式的后端接口地址 | `/api/robot/chat` |
| `VITE_ROBOT_LLM_EXTRA_BODY` | **厂商扩展参数透传**（JSON 字符串），见下表 | 空 |

调用链：

```
浏览器 ──/api/robot/chat──► vite dev proxy ──/robot/chat──► NestJS RobotService ──► 大模型服务
（proxy 模式，axios 自动带 JWT，后端 .env 读 key）              （OpenAI 兼容 /chat/completions）

浏览器 ──fetch──► 大模型服务
（direct 模式，dev.env 读 key，需服务方支持 CORS）
```

**EXTRA_BODY 用法**（联网搜索等厂商扩展参数，前后端均支持）：

| 服务 | BASE_URL | MODEL | EXTRA_BODY |
|---|---|---|---|
| 通义千问（联网搜索） | `https://dashscope.aliyuncs.com/compatible-mode/v1` | `qwen-plus` | `{"enable_search":true}` |
| Kimi（联网搜索） | `https://api.moonshot.cn/v1` | `moonshot-v1-8k` | `{"tools":[{"type":"builtin_function","function":{"name":"$web_search"}}]}` |
| DeepSeek（无联网） | `https://api.deepseek.com` | `deepseek-chat` | 留空 |

> Perplexity（`api.perplexity.ai`）虽内置搜索且兼容 OpenAI 协议，但**国内网络不可达**，未采用。

**后端 proxy 对应配置**（`template/nestJs/.env`，修改后必须重启后端）：

```bash
LLM_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
LLM_API_KEY=sk-你的key
LLM_MODEL=qwen-plus
LLM_EXTRA_BODY={"enable_search":true}
```

### 2.4 ⚠️ dev.env 不会自动注入 import.meta.env

**本项目最大的坑**：Vite 只自动加载项目根目录的 `.env` 文件；`dev.env` 仅被 `vite.config.dev.ts` 中的 `configDotenv` 读取（用于 proxy 配置和显式 `define`）。因此**所有新加的 `VITE_*` 变量必须在 `config/vite.config.dev.ts` 和 `vite.config.prod.ts` 的 `define` 中显式注入**，否则前端读到 `undefined`：

```ts
define: {
  'import.meta.env.VITE_TINY_ROBOT_ENABLED': JSON.stringify(
    process.env.VITE_TINY_ROBOT_ENABLED || 'false',
  ),
  // ... 每个 VITE_ROBOT_LLM_* 变量同理
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

- 集成点：`base-info.vue`（基础表单页，`/vue-pro/form/base`）底部"富文本说明"表单项，同样用 `defineAsyncComponent` + `v-if="import.meta.env.VITE_TINY_EDITOR_ENABLED === 'true'"` 控制。

---

## 四、使用说明

### 4.1 初始化时选择功能

```bash
tiny init pro
# ... 项目名称、服务端技术栈、构建工具 ...
# 请选择需要额外集成的功能（可多选）:   ← 空格选择，回车确认
#  (*) TinyRobot 智能助手（AI 对话）
#  (*) TinyEditor 富文本编辑器
```

生成项目后 `dev.env` 中对应开关自动变为 `true`。

### 4.2 已有项目开启/关闭功能

改 `web/dev.env` 开关 → **重启 dev server** → 浏览器硬性刷新（`Ctrl+Shift+R`，清掉异步组件旧缓存）。

### 4.3 配置大模型（以通义千问实时问答为例）

**proxy 模式（推荐）**：

1. 前端 `dev.env` 保持 `VITE_ROBOT_LLM_MODE=proxy`，`EXTRA_BODY={"enable_search":true}` 会自动透传给后端；
2. 后端 `nestJs/.env` 填 `LLM_API_KEY`（`sk-` 开头，百炼平台申请）；
3. **重启后端**（`.env` 只在进程启动时读入内存）+ 重启前端。

**direct 模式（本地快速 demo）**：

```
VITE_ROBOT_LLM_MODE=direct
VITE_ROBOT_LLM_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
VITE_ROBOT_LLM_API_KEY=sk-你的key
VITE_ROBOT_LLM_MODEL=qwen-plus
VITE_ROBOT_LLM_EXTRA_BODY={"enable_search":true}
```

重启前端 + 硬性刷新即可，不需要后端。

### 4.4 验证清单

```bash
pnpm build                          # 套件 tsc 编译
npx tslint --project .              # 套件 tslint
pnpm -F tiny-pro-vue lint           # 模板 eslint
pnpm -F tiny-pro-vue build          # 模板生产构建（确认 chunk 正常）
pnpm -F tinyui-nestjs-server build  # 后端编译
```

功能冒烟：开关 `true` 时页面右下角出现 AI 按钮、基础表单页出现富文本；开关 `false` 时消失且 Network 中无对应 chunk 请求。

---

## 五、常见问题（FAQ）

| 现象 | 原因 | 解决 |
|---|---|---|
| 回复一直是"已收到你的问题…"（旧 mock 话术） | dev server 没重启 / 浏览器缓存旧异步 chunk | 重启 dev server + `Ctrl+Shift+R` 硬性刷新 |
| 功能开关改了不生效 | `dev.env` 只在启动时读取 | 重启 dev server |
| `import.meta.env.XXX` 为 `undefined` | 新变量没加 vite define 注入 | 见 2.4 节 |
| proxy 模式 500"服务端未配置 LLM_API_KEY" | 后端 `.env` 没配 LLM_* | 配好后**重启后端** |
| proxy 模式 502 | 上游大模型返回错误（多为 key 无效 401），被包装为 502 | 看 AI 气泡里的具体错误；key 要匹配 BASE_URL 对应平台 |
| direct 模式 401 | key 无效或填错平台（如 DeepSeek 的 key 用于通义） | 换对应平台合法的 key |
| 直连 Perplexity 超时 | 国内网络不可达 | 换通义/Kimi |
| 模型答不了天气等实时问题 | 模型本身无联网能力 | 配 `EXTRA_BODY` 开启联网搜索（见 2.3 表） |
| 改了 `nestJs/.env` 不生效 | 进程启动时读入内存 | 重启后端 |
| **key 泄露风险** | direct 模式 key 打进前端 bundle；key 禁止写入 `config-schema.ts` 默认值 / `init.ts` / 任何会提交的文件 | 用 proxy 模式；已泄露的 key 立即吊销 |

---

## 六、如何新增第三个功能

1. `src/lib/interfaces.ts` 的 `FeatureType` 枚举加值，`FEATURE_OPTIONS` 数组加一项（`name` / `value` / `envKey` 三元组）；
2. `template/tinyvue/dev.env` 加 `VITE_XXX_ENABLED=false` 占位，`src/env.d.ts` 加声明；
3. `config/vite.config.dev.ts` 和 `vite.config.prod.ts` 的 `define` 中补注入（见 2.4）；
4. 模板中实现功能组件，用 `defineAsyncComponent` + `v-if` env 开关挂载；
5. 若带依赖，加入 `template/tinyvue/package.json`（所有构建工具共用 dependencies 清单，无需动 `interfaces.ts` 的增删逻辑——那是构建工具维度的裁剪）。

完成以上后，`tiny init pro` 的多选问题会自动出现新选项，无需改 `init.ts` 的问询与 env 改写逻辑（`FEATURE_OPTIONS` 驱动）。
