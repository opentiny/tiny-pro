import { createRequire } from 'node:module';
import path from 'node:path';
import { defineConfig, mergeConfig, loadEnv } from 'vite';
import { useTinyEngineBaseConfig } from '@opentiny/tiny-engine-vite-config';

const require = createRequire(import.meta.url);
// Vite 8 会把这个包的 .cjs 入口当成含 import 的脚本解析失败，改用 ESM 入口。
const baselineBrowserMapping = require
  .resolve('baseline-browser-mapping')
  .replace(/index\.cjs$/, 'index.js');

export default defineConfig((configEnv) => {
  // 加载环境变量（从 env 目录加载）
  const env = loadEnv(configEnv.mode, path.resolve(__dirname, './env'), '');

  // 获取 base 路径，默认为 '/'，可通过 VITE_DESIGNER_BASE 环境变量配置
  // 例如：VITE_DESIGNER_BASE=/designer/ 用于部署到 /designer/ 路径下
  const base = env.VITE_DESIGNER_BASE || '/';

  const baseConfig = useTinyEngineBaseConfig({
    viteConfigEnv: configEnv,
    root: __dirname,
    iconDirs: [
      path.resolve(__dirname, './node_modules/@opentiny/tiny-engine/assets/'),
    ],
    useSourceAlias: false,
    envDir: './env',
    registryPath: './registry.js',
  });

  const customConfig = {
    resolve: {
      alias: {
        'baseline-browser-mapping': baselineBrowserMapping,
      },
    },
    base, // 配置静态资源前缀
    envDir: './env',
    publicDir: path.resolve(__dirname, './public'),
    server: {
      port: 8090,
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
    build: {
      // 确保构建时使用正确的 base 路径
      outDir: 'dist',
      assetsDir: 'assets',
    },
  };

  return mergeConfig(baseConfig, customConfig);
});
