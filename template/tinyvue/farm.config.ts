import { defineConfig, loadEnv } from '@farmfe/core';
import vue from '@vitejs/plugin-vue';
import less from '@farmfe/js-plugin-less';
import { join, resolve } from 'path';
import { configDotenv } from 'dotenv';

configDotenv({
  path: './.env',
});

export default defineConfig({
  vitePlugins: [vue()],
  plugins: [
    less({
      additionalData: `@import "${resolve(__dirname, 'src/assets/style/breakpoint.less')}";`,
    }),
  ],
  compilation: {
    define: {
      'process.env': {},
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
        '@': join(__dirname, 'src'),
        'assets': join(__dirname, 'src/assets'),
        'vue-i18n': 'vue-i18n/dist/vue-i18n.esm-bundler.js',
        'vue': 'vue/dist/vue.esm-bundler.js',
      },
      extensions: ['.ts', '.js'],
    },
  },
  server: {
    proxy: {
      '/mock': {
        pathFilter(pathname, req) {
          return Boolean(pathname.match('^/mock'));
        },
        pathRewrite: {
          '^/mock': '/mock',
        },
        target: 'http://localhost:3000',
        logger: console,
      },
      '/api': {
        pathRewrite: {
          '^/api': '',
        },
        target: 'http://localhost:3000',
        pathFilter(pathname, req) {
          return Boolean(pathname.match('^/api'));
        },
        logger: console,
      },
    },
  },
});
