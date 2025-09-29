# TinyPro Generate Code Plugin

TinyPro 代码生成插件，为 TinyEngine 提供增强的代码生成和系统集成功能。

## 安装

```bash
npm install @tinypro/generate-code-plugin
```

## 使用方法

### 在 TinyEngine 项目中引入

```javascript
import TinyProGenerateCodePlugin from "@tinypro/generate-code-plugin";
import "@tinypro/generate-code-plugin/style.css";

// 在你的插件注册代码中使用
const plugins = [
  TinyProGenerateCodePlugin,
  // 其他插件...
];
```

### 作为 Vue 插件使用

```javascript
import { createApp } from "vue";
import { install as installTinyProPlugin } from "@tinypro/generate-code-plugin";

const app = createApp({});
app.use(installTinyProPlugin);
```

## 功能特性

- 🚀 基于 TinyEngine 的代码生成功能
- 🔧 TinyPro 系统集成支持
- 📁 本地文件保存功能
- 🎨 现代化的 UI 界面
- ⚡ 高性能的代码生成引擎

## 开发

```bash
# 安装依赖
npm install

# 开发模式（监听文件变化）
npm run dev

# 构建
npm run build
```

## 依赖要求

此插件需要以下 peer dependencies：

- `@opentiny/tiny-engine`: ^2.7.0
- `@opentiny/tiny-engine-meta-register`: ^2.7.0
- `@opentiny/tiny-engine-utils`: ^2.7.0
- `@opentiny/vue`: ~3.20.0
- `vue`: ^3.4.21

## License

MIT
