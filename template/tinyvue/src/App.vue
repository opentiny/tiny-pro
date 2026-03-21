<script lang="ts" setup>
import { WebMcpClient } from '@opentiny/next-sdk'
import { TinyRemoter } from '@opentiny/next-remoter'
import { TinyConfigProvider } from '@opentiny/vue'
import TinyThemeTool from '@opentiny/vue-theme/theme-tool'
import { onMounted, ref } from 'vue'
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

const AGENT_URL = 'https://agent.opentiny.design/api/v1/webmcp-trial/'
const sessionID = ref('')

// 启动 MCP Server（注册工具 + 建立通信通道）
onMounted(async () => {
  await createMcpServer()

  // 远程连接
  const client = new WebMcpClient()
  await client.connect(clientTransport)
  // 这个 sessionId 是 Web 应用与 WebAgent 服务建立连接后，由 WebAgent 服务生成的，用来唯一标识被操控的 Web 应用（被控端）
  const { sessionId } = await client.connect({
    agent: true,
    url: `${AGENT_URL}mcp`,
    sessionId: '5343d3ee-47c6-49a3-9052-c68eed6f5b50'
  })
  console.log('sessionId', sessionId);

  sessionID.value = sessionId
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
    :agent-root="AGENT_URL"
    :session-id="sessionID"
  />
</template>

<style lang="less" scoped>
  @import '@/assets/style/menu.less'; /* 引入公共样式 */
</style>
