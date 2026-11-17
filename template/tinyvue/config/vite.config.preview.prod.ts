import process from 'node:process'
import { mergeConfig } from 'vite'
import { vueManualChunk } from './manual-chunks'
import configCompressPlugin from './plugin/compress'
import configVisualizerPlugin from './plugin/visualizer'
import baseConig from './vite.config.preview.base'

export default mergeConfig(
  {
    mode: 'pages',
    mock: true,
    base: `${process.env.static_url_prefix}/tiny-pro-vue/${process.env.staticReleaseVersion}/vue-pro/pages`,
    plugins: [
      configCompressPlugin('gzip'),
      configVisualizerPlugin(),
    ],
    build: {
      rollupOptions: {
        output: {
          manualChunks: vueManualChunk,
        },
      },
      chunkSizeWarningLimit: 2000,
    },
  },
  baseConig,
)
