import { resolve } from 'node:path'
import process from 'node:process'
import { configDotenv } from 'dotenv'
import { loadEnv, mergeConfig } from 'vite'
import baseConfig from './vite.config.base'

// 加载 dev.env 文件
configDotenv({
  path: resolve(__dirname, '../dev.env'),
})

// 加载环境变量（development 模式会读取 .env.development 和 .env）
const env = loadEnv('development', process.cwd())
const useMock = env.VITE_USE_MOCK === 'true'
const apiTarget = useMock ? env.VITE_MOCK_HOST : env.VITE_SERVER_HOST

const proxyConfig = {
  [env.VITE_BASE_API]: {
    target: apiTarget,
    changeOrigin: true,
    logLevel: 'debug',
  },
  [env.VITE_MOCK_SERVER_HOST]: {
    target: apiTarget,
    changeOrigin: true,
    rewrite: (path: string) => {
      return path.replace(
        new RegExp(`^${env.VITE_MOCK_SERVER_HOST}`),
        useMock ? '' : `${env.VITE_BASE_API}/mock`,
      )
    },
  },
}
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
    },
    plugins: [],
  },
  baseConfig,
)
