import process from 'node:process'
import { loadEnv, mergeConfig } from 'vite'
import configCompressPlugin from './plugin/compress'
import configVisualizerPlugin from './plugin/visualizer'
import baseConfig from './vite.config.base'

export default mergeConfig(
  {
    mode: 'production',
    base: loadEnv('', process.cwd()).VITE_BASE || '/',
    plugins: [configCompressPlugin('gzip'), configVisualizerPlugin()],
    define: {
      // 确保环境变量被注入到客户端代码
      'import.meta.env.VITE_LOWCODE_DESIGNER_ENABLED': JSON.stringify(
        process.env.VITE_LOWCODE_DESIGNER_ENABLED || 'false',
      ),
      'import.meta.env.VITE_LOWCODE_DESIGNER_URL': JSON.stringify(
        process.env.VITE_LOWCODE_DESIGNER_URL || '/designer',
      ),
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
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            vue: ['vue', 'vue-router', 'pinia', '@vueuse/core', 'vue-i18n'],
          },
        },
      },
      chunkSizeWarningLimit: 2000,
    },
  },
  baseConfig,
)
