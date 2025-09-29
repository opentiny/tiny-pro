/**
 * TinyPro Generate Code 插件入口
 * 基于原有的 generate-code 插件，增加了 TinyPro 系统集成功能
 */

import entry from "./Main.vue";
import metaData from "./meta.js";
import { SaveLocalService } from "./composable/index.js";
import "./styles/vars.less";

// 主插件对象
const TinyProGenerateCodePlugin = {
  ...metaData,
  entry,
  metas: [SaveLocalService],
};

// 默认导出插件
export default TinyProGenerateCodePlugin;

// 命名导出
export { SaveLocalService, TinyProGenerateCodePlugin };

// 提供安装函数供 Vue 应用使用
export const install = (app, options = {}) => {
  // 可以在这里添加全局组件注册等逻辑
  return TinyProGenerateCodePlugin;
};
