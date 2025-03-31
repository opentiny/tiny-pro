const { resolve } = require('path');
const { VueLoaderPlugin } = require('vue-loader');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const rspack = require('@rspack/core');
const { configDotenv, parse } = require('dotenv');
const { default: importMetaLoader } = require('import-meta-loader');
configDotenv({
  path: './.env',
});

/** @type {import('@rspack/cli').Configuration} */
const config = {
  context: __dirname,
  entry: {
    main: './src/main.ts',
  },
  output: {
    path: resolve(__dirname, 'dist'), // 打包后的文件输出的目录
    filename: `js/[name]_[chunkhash:8].js`, // 设置打包后的 js 文件名，如果在文件名前增加文件路径，会将打包后的 js 文件放在指定的文件夹下
    publicPath: '/',
  },
  experiments: {
    css: false,
  },
  plugins: [
    new VueLoaderPlugin(),
    new rspack.HtmlRspackPlugin({
      template: './index.html',
    }),
    new rspack.DefinePlugin({
      '__VUE_OPTIONS_API__': JSON.stringify(true),
      '__VUE_PROD_DEVTOOLS__': JSON.stringify(false),
      'import.meta.env.VITE_CONTEXT': '"/vue-pro/"',
      'import.meta.env.VITE_BASE_API': '"/api"',
      'import.meta.env.VITE_SERVER_HOST': '"http://127.0.0.1:3000"',
      'import.meta.env.VITE_MOCK_HOST': '"http://127.0.0.1:8848"',
      'import.meta.env.VITE_USE_MOCK': 'false',
      'import.meta.env.VITE_MOCK_IGNORE':
        '"/api/user/userInfo,/api/user/login,/api/user/register,/api/employee/getEmployee"',
      'import.meta.env.VITE_MOCK_SERVER_HOST': '"/mock"',
      'BUILD_TOOLS': "'RSPACK'",
    }),
  ],
  devServer: {
    historyApiFallback: true,
    proxy: [
      {
        context: [process.env.VITE_BASE_API],
        target: process.env.VITE_SERVER_HOST,
        changeOrigin: true,
        pathRewrite: {
          '^/api': '',
        },
      },
      {
        context: ['/mock'],
        target: process.env.VITE_SERVER_HOST,
        changeOrigin: true,
        pathRewrite: {
          '^/mock': '/mock',
        },
      },
    ],
    client: {
      overlay: false,
    },
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          experimentalInlineMatchResource: true,
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(ts)$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              appendTsSuffixTo: [/\.vue$/],
              transpileOnly: true,
            },
          },
        ],
        exclude: /node_modules/,
      },
      {
        test: /\.less$/,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'less-loader',
            options: {
              additionalData: `@import "${resolve('./src/assets/style/breakpoint.less')}";`,
            },
          },
        ],
      },
      {
        test: /.(png|jpg|jpeg|gif|svg)$/, // 匹配图片文件
        type: 'asset', // type选择asset
        parser: {
          dataUrlCondition: {
            maxSize: 10 * 1024, // 小于10kb转base64位
          },
        },
        generator: {
          filename: 'static/images/[name].[contenthash:8][ext]', // 文件输出目录和命名
        },
      },
      {
        test: /.(woff2?|eot|ttf|otf)$/, // 匹配字体图标文件
        type: 'asset', // type选择asset
        parser: {
          dataUrlCondition: {
            maxSize: 10 * 1024, // 小于10kb转base64位
          },
        },
        generator: {
          filename: 'static/fonts/[name].[contenthash:8][ext]', // 文件输出目录和命名
        },
      },
      {
        test: /.(mp4|webm|ogg|mp3|wav|flac|aac)$/, // 匹配媒体文件
        type: 'asset', // type选择asset
        parser: {
          dataUrlCondition: {
            maxSize: 10 * 1024, // 小于10kb转base64位
          },
        },
        generator: {
          filename: 'static/media/[name].[contenthash:8][ext]', // 文件输出目录和命名
        },
      },
      {
        test: /\.svg$/,
        type: 'asset/resource',
      },
      {
        test: /\.m?js/,
        resolve: {
          fullySpecified: false,
        },
      },
    ],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      'assets': resolve(__dirname, 'src/assets'),
      'vue-i18n$': 'vue-i18n/dist/vue-i18n.esm-bundler.js',
      'vue$': 'vue/dist/vue.esm-bundler.js',
    },
    extensions: ['.ts', '.js', '.vue'],
  },
};
module.exports = config;
