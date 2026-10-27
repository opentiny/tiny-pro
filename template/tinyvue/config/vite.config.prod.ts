import process from 'node:process'
import { mergeConfig } from 'vite'
import configCompressPlugin from './plugin/compress'
import configVisualizerPlugin from './plugin/visualizer'
import baseConfig from './vite.config.base'

export default mergeConfig(
  {
    mode: 'production',
    base: process.env.VITE_BASE || '/',
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
      // 模拟登录开关：仅前端项目为 true，登录不请求后端接口
      'import.meta.env.VITE_MOCK_LOGIN_ENABLED': JSON.stringify(
        process.env.VITE_MOCK_LOGIN_ENABLED || 'false',
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
