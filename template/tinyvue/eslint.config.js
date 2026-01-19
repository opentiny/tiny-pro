import antfu from '@antfu/eslint-config'

export default antfu({
  ignores: [
    'dist',
    'node_modules',
    '*.min.js',
    '*.d.ts',
    'coverage',
    'public',
    'farm.config.ts',
    'webpack.config.js',
    'rspack.config.js',
    '.vscode/*',
  ],
  formatters: true,
  unocss: true,
  vue: true,
})
