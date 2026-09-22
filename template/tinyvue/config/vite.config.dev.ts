import { resolve } from 'node:path'
import process from 'node:process'
import { configDotenv } from 'dotenv'
import { loadEnv, mergeConfig } from 'vite'
import { createDevProxyConfig } from './dev-proxy'
import baseConfig from './vite.config.base'

// 加载 dev.env 文件
configDotenv({
  path: resolve(__dirname, '../dev.env'),
})

// 加载环境变量（development 模式会读取 .env.development 和 .env）
const env = loadEnv('development', process.cwd())
const useMock = env.VITE_USE_MOCK === 'true'
const proxyConfig = createDevProxyConfig(env, useMock)

export default mergeConfig(
  {
    mode: 'development',
    server: {
      open: process.env.CI !== 'true',
      fs: {
        strict: true,
      },
      proxy: {
        ...proxyConfig,
      },
    },
    define: {
      // 确保 VITE_LOWCODE_DESIGNER_ENABLED 被注入到客户端代码
      'import.meta.env.VITE_LOWCODE_DESIGNER_ENABLED': JSON.stringify(
        process.env.VITE_LOWCODE_DESIGNER_ENABLED || 'false',
      ),
      // 确保 VITE_LOWCODE_DESIGNER_URL 被注入到客户端代码
      'import.meta.env.VITE_LOWCODE_DESIGNER_URL': JSON.stringify(
        process.env.VITE_LOWCODE_DESIGNER_URL || 'http://localhost:8090',
      ),
      // 确保可选功能开关与 TinyRobot 大模型配置被注入到客户端代码
      'import.meta.env.VITE_TINY_ROBOT_ENABLED': JSON.stringify(
        process.env.VITE_TINY_ROBOT_ENABLED || 'false',
      ),
      'import.meta.env.VITE_TINY_EDITOR_ENABLED': JSON.stringify(
        process.env.VITE_TINY_EDITOR_ENABLED || 'false',
      ),
      'import.meta.env.VITE_ROBOT_LLM_MODE': JSON.stringify(
        process.env.VITE_ROBOT_LLM_MODE || 'proxy',
      ),
      'import.meta.env.VITE_ROBOT_LLM_BASE_URL': JSON.stringify(
        process.env.VITE_ROBOT_LLM_BASE_URL || 'https://api.deepseek.com',
      ),
      'import.meta.env.VITE_ROBOT_LLM_API_KEY': JSON.stringify(
        process.env.VITE_ROBOT_LLM_API_KEY || '',
      ),
      'import.meta.env.VITE_ROBOT_LLM_MODEL': JSON.stringify(
        process.env.VITE_ROBOT_LLM_MODEL || 'deepseek-chat',
      ),
      'import.meta.env.VITE_ROBOT_LLM_PROXY_URL': JSON.stringify(
        process.env.VITE_ROBOT_LLM_PROXY_URL || '/api/robot/chat',
      ),
      'import.meta.env.VITE_ROBOT_LLM_EXTRA_BODY': JSON.stringify(
        process.env.VITE_ROBOT_LLM_EXTRA_BODY || '',
      ),
    },
    plugins: [],
  },
  baseConfig,
)
