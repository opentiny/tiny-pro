/**
 * NestJS webpack 自定义配置。
 *
 * @nestjs/cli 默认通过 webpack-node-externals 将 node_modules 标记为外部依赖，
 * 避免打包 NestJS 的可选惰性依赖（kafkajs/mqtt/nats/grpc 等，无需安装）。
 * 但它默认只扫描「当前目录/node_modules」：
 * - pnpm 布局下 nestJs/node_modules 是符号链接齐全的，默认行为即可；
 * - npm workspaces 会把依赖提升到 monorepo 根目录，nestJs/node_modules 几乎为空，
 *   默认扫描不到任何外部模块，导致 @nestjs/* 被打包并解析不到可选依赖而报错。
 * 这里同时挂载包自身与 monorepo 根目录两个 node_modules 扫描源，兼容两种布局。
 */
const path = require('path');
const fs = require('fs');
const nodeExternals = require('webpack-node-externals');

module.exports = function (options) {
  const externals = [nodeExternals()];
  const rootModulesDir = path.resolve(__dirname, '../node_modules');
  if (fs.existsSync(rootModulesDir)) {
    externals.push(nodeExternals({ modulesDir: rootModulesDir }));
  }
  return {
    ...options,
    externals,
  };
};
