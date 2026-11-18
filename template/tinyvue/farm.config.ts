import { fileURLToPath } from 'node:url';
import { join, resolve } from 'node:path';
import { defineConfig } from '@farmfe/core';
import vue from '@vitejs/plugin-vue';
import less from '@farmfe/js-plugin-less';
import { configDotenv } from 'dotenv';
import { farmUnoCss } from './config/farm-unocss';

const root = fileURLToPath(new URL('.', import.meta.url));

configDotenv({
  path: './.env',
});

export default defineConfig(({ command }) => ({
  vitePlugins: [vue()],
  plugins: [
    farmUnoCss(root),
    less({
      additionalData: `@import "${resolve(root, 'src/assets/style/breakpoint.less')}";`,
    }),
  ],
  compilation: {
    define: {
      'process.env.NODE_ENV': JSON.stringify(command === 'build' || command === 'preview' ? 'production' : 'development'),
      'BUILD_TOOLS': '"VITE"',
      'import.meta.env.VITE_CONTEXT': '"/vue-pro/"',
      'import.meta.env.VITE_BASE_API': '"/api"',
      'import.meta.env.VITE_SERVER_HOST': '"http://127.0.0.1:3000"',
      'import.meta.env.VITE_MOCK_HOST': '"http://127.0.0.1:8848"',
      'import.meta.env.VITE_USE_MOCK': 'false',
      'import.meta.env.VITE_MOCK_IGNORE':
        '"/api/user/userInfo,/api/user/login,/api/user/register,/api/employee/getEmployee"',
      'import.meta.env.VITE_MOCK_SERVER_HOST': '"/mock"',
    },
    resolve: {
      alias: {
        '@': join(root, 'src'),
        'assets': join(root, 'src/assets'),
        'vue-i18n': 'vue-i18n/dist/vue-i18n.esm-bundler.js',
        'vue': 'vue/dist/vue.esm-bundler.js',
      },
      extensions: ['.ts', '.js'],
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        rewrite: (requestPath: string) => requestPath.replace(/^\/api/, ''),
      },
    },
  },
}));
