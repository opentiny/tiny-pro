import { defineConfig } from 'vitepress'

const zhSidebar = [
  { text: '总览', link: '/start' },
  { text: '快速上手', link: '/quick-start' },
  { text: '后端指南', link: '/back-end-guide' },
  { text: '前端指南', link: '/front-end-guide' },
  { text: '目录结构', link: '/directory' },
  { text: '路由与菜单', link: '/menu' },
  { text: '新增页面', link: '/newpage' },
  { text: 'Mock数据', link: '/request' },
  { text: '国际化', link: '/international' },
  { text: '个性化主题', link: '/theme' },
  { text: '布局', link: '/layout' },
  { text: '状态管理', link: '/status' },
  { text: '权限控制', link: '/permissions' },
]
export default defineConfig({
  title: 'TinyPro',
  description: '开箱即用的中后台前端/设计解决方案',
  cleanUrls: true,
  themeConfig: {
    socialLinks: [
      { icon: 'github', link: 'https://github.com/opentiny/tiny-pro' },
    ],
    search: {
      provider: 'local',
    },
  },
  locales: {
    root: {
      label: '简体中文',
      lang: 'zh-CN',
      description: '开箱即用的中后台前端/设计解决方案',
      themeConfig: {
        nav: [
          { text: '指南', link: '/start' },
          { text: '快速上手', link: '/quick-start' },
        ],
        sidebar: zhSidebar,
        outline: { label: '本页目录' },
        docFooter: { prev: '上一篇', next: '下一篇' },
        darkModeSwitchLabel: '外观',
        sidebarMenuLabel: '菜单',
        returnToTopLabel: '回到顶部',
        langMenuLabel: '切换语言',
      },
    },
  },
})
