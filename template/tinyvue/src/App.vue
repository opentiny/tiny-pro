<script lang="ts" setup>
import { TinyRemoter } from '@opentiny/next-remoter'
import { createMessageChannelPairTransport, WebMcpClient, WebMcpServer, z } from '@opentiny/next-sdk'
import { TinyConfigProvider } from '@opentiny/vue'
import TinyThemeTool from '@opentiny/vue-theme/theme-tool'
import { onMounted, provide, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import GlobalSetting from '@/components/global-setting/index.vue'
import { useTheme } from './hooks/useTheme'
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

const sessionId = ref('')
const [serverTransport, clientTransport] = createMessageChannelPairTransport()
provide('serverTransport', serverTransport)

const AGENT_URL = 'https://agent.opentiny.design/api/v1/webmcp-trial/' // 'http://localhost:3030/api/v1/webmcp/'

onMounted(async () => {
  const server = new WebMcpServer()
  const $router = useRouter()
  const $route = useRoute()

  // TODO: 参数需要优化，用户不会知道具体的路由路径，用户的语言可能是：帮我打开菜单管理页面，这时应该根据名称获取路由路径，再做路由跳转
  // 进一步优化：用户可能在任意页面直接提需求：帮我创建 xx 菜单，这时 AI 应该先跳转菜单管理页面，然后调佣创建菜单的工具
  server.registerTool(
    'switch-router',
    {
      title: '切换路由',
      description: '切换路由',
      inputSchema: {
        routerPath: z.string().describe('路由路径'),
      },
    },
    async ({ routerPath }) => {
      if ($route.path === routerPath) {
        return { content: [{ type: 'text', text: routerPath }] }
      }

      $router.push(import.meta.env.VITE_CONTEXT + routerPath)
      return { content: [{ type: 'text', text: routerPath }] }
    },
  )
  await server.connect(serverTransport)

  // 创建 WebMcpClient ，并与 WebAgent 连接
  const client = new WebMcpClient()
  await client.connect(clientTransport)
  const { sessionId: sessionID } = await client.connect({
    agent: true,

    // sessionId 为可选参数。若传入该参数，系统将使用指定值作为会话标识；若未传入，WebAgent 服务将自动生成一个随机的字符串作为 sessionId。为便于通过 MCP Inspector 工具进行调试，此处采用了固定的 sessionId。用户亦可通过浏览器原生提供的 crypto.randomUUID() 方法生成随机字符串作为会话标识。
    sessionId: 'd299a869-c674-4125-a84b-bb4e24079b99',

    url: `${AGENT_URL}mcp`,
  })
  sessionId.value = sessionID
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
    :agent-root="AGENT_URL"
    :session-id="sessionId"
    :menu-items="[
      {
        action: 'qr-code',
        show: false,
      },
      {
        action: 'remote-control',
        show: false,
      },
      {
        action: 'remote-url',
        show: false,
      },
    ]"
    :skills="skills"
  />
</template>

<style lang="less" scoped>
  @import '@/assets/style/menu.less'; /* 引入公共样式 */
</style>
