import { defineConfig, presetMini, presetAttributify } from 'unocss'

export default defineConfig({
  presets: [
    presetMini(),
    presetAttributify(),
  ],
  theme: {
    breakpoints: {
      // 移动端断点
      xs: '320px',    // 手机竖屏
      sm: '375px',    // 手机横屏
      md: '768px',    // 平板竖屏
      lg: '1024px',   // 平板横屏
      xl: '1280px',   // 桌面端
      '2xl': '1536px' // 大屏
    },
    colors: {
      primary: {
        50: '#eff6ff',
        500: '#3b82f6',
        600: '#2563eb',
        700: '#1d4ed8',
      }
    }
  },
  shortcuts: {
    // 响应式布局
    'container-responsive': 'px-4 md:px-6 lg:px-8 max-w-7xl mx-auto',
    'layout-responsive': 'min-h-screen bg-gray-50',

    // 移动端优化
    'btn-mobile': 'px-4 py-3 rounded-lg bg-primary-500 text-white text-base font-medium touch-manipulation active:bg-primary-600',
    'input-mobile': 'w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-primary-500 focus:border-transparent',
    'card-mobile': 'bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6',

    // 响应式显示隐藏
    'hide-mobile': 'block md:hidden',
    'show-mobile': 'hidden md:block',
    'hide-tablet': 'block lg:hidden',
    'show-tablet': 'hidden lg:block',

    // 布局相关
    'sidebar-responsive': 'fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0',
    'content-responsive': 'flex-1 overflow-auto',
  },
  rules: [
    // 触摸操作优化
    [/^touch-/, ([, d]) => ({ 'touch-action': d })],
    // 移动端字体大小
    [/^text-mobile-(\d+)$/, ([, d]) => ({ 'font-size': `${d}px` })],
    // 安全区域适配
    [/^safe-(\w+)$/, ([, d]) => ({ [`padding-${d}`]: 'env(safe-area-inset-' + d + ')' })]
  ]
})
