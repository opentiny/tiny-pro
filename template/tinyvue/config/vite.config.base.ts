import { resolve } from 'node:path'
import process from 'node:process'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import UnoCSS from 'unocss/vite'
import { defineConfig, loadEnv } from 'vite'
import svgLoader from 'vite-svg-loader'

const config = {
  plugins: [
    vue(),
    vueJsx(),
    svgLoader({ svgoConfig: {} }),
    UnoCSS(),
  ],
  build: {
    outDir: resolve(__dirname, loadEnv('', process.cwd()).VITE_OUT_DIR || '../dist'),
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  resolve: {
    alias: [
      {
        find: '@',
        replacement: resolve(__dirname, '../src'),
      },
      {
        find: 'assets',
        replacement: resolve(__dirname, '../src/assets'),
      },
      {
        find: 'vue-i18n',
        replacement: 'vue-i18n/dist/vue-i18n.esm-bundler.js', // Resolve the i18n warning issue
      },
      {
        find: 'vue',
        replacement: 'vue/dist/vue.esm-bundler.js', // compile template
      },
      {
        find: '@opentiny/vue-icon',
        replacement: resolve(__dirname, '../node_modules/@opentiny/vue-icon'), // compile template
      },
      {
        find: '@opentiny/vue-theme',
        replacement: resolve(__dirname, '../node_modules/@opentiny/vue-theme'),
      },
    ],
    extensions: ['.ts', '.js', '.css'],
    preserveSymlinks: false,
  },
  define: {
    BUILD_TOOLS: '\'VITE\'',
  },
  optimizeDeps: {
    esbuildOptions: {
      resolveExtensions: ['.ts', '.js', '.css'],
    },
  },
  css: {
    preprocessorOptions: {
      less: {
        modifyVars: {
          hack: `true; @import (reference) "${resolve(
            'src/assets/style/breakpoint.less',
          )}";`,
        },
        javascriptEnabled: true,
      },
    },
  },
}
export default defineConfig(config)
