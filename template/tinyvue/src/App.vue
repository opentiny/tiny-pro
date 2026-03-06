<script lang="ts" setup>
import { TinyRemoter } from '@opentiny/next-remoter'
import { TinyConfigProvider } from '@opentiny/vue'
import TinyThemeTool from '@opentiny/vue-theme/theme-tool'
import { onMounted } from 'vue'
import GlobalSetting from '@/components/global-setting/index.vue'
import { useTheme } from './hooks/useTheme'
import { clientTransport, createMcpServer } from './mcp-servers'
import { skills } from './skills'
import '@opentiny/next-remoter/dist/style.css'

const theme = new TinyThemeTool()
useTheme(theme)

const design = {
  name: 'x-design', // 设计规范名称
  version: '1.0.0', // 设计规范版本号
  components: {
    Button: {
      props: {
        resetTime: 0,
        round: true,
      },
    },
  },
}

// 将本地 MCP Server 注册到 TinyRemoter
// key 为服务器名称（自定义），type: 'local' 表示浏览器本地运行
const mcpServers = {
  'my-mcp-server': {
    type: 'local',
    transport: clientTransport,
  },
}

// 启动 MCP Server（注册工具 + 建立通信通道）
onMounted(async () => {
  await createMcpServer()
})
</script>

<template>
  <div>
    <TinyConfigProvider :design="design">
      <router-view />
    </TinyConfigProvider>

    <GlobalSetting />
  </div>
  <TinyRemoter
    :skills="skills"
    :mcp-servers="mcpServers"
  />
</template>

<style lang="less" scoped>
  @import '@/assets/style/menu.less'; /* 引入公共样式 */
</style>
