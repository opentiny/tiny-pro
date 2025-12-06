<template>
  <div>
    <tiny-config-provider :design="design">
      <router-view />
    </tiny-config-provider>

    <global-setting />
    <p>当前数字：{{ numberValue }}</p>
    <tiny-remoter
      agent-root="http://localhost:3040/api/v1/webmcp/"
      :session-id="sessionId"
      :menuItems="[
        {
          action: 'qr-code',
          show: false
        },
        {
          action: 'remote-control',
          show: false
        },
        {
          action: 'remote-url',
          show: false
        }
      ]"
    />
  </div>
</template>

<script lang="ts" setup>
  import { provide } from 'vue';
  import { TinyConfigProvider } from '@opentiny/vue';
  import GlobalSetting from '@/components/global-setting/index.vue';
  import TinyThemeTool from '@opentiny/vue-theme/theme-tool';

  import { onMounted, ref } from 'vue'
  import { WebMcpServer, createMessageChannelPairTransport, z, WebMcpClient } from '@opentiny/next-sdk'
  import { TinyRemoter } from '@opentiny/next-remoter'
  import { useTheme } from './hooks/useTheme';
  import '@opentiny/next-remoter/dist/style.css'

  const sessionId = ref('')
  const numberValue = ref(0)
  onMounted(async () => {
    // 创建 WebMcpServer ，并与 ServerTransport 连接
    const [serverTransport, clientTransport] = createMessageChannelPairTransport()

    const server = new WebMcpServer()

    server.registerTool(
      'counter',
      {
        title: '自增一个数字',
        description: '在现有数字基础上自增一个数值，初始数字是0',
        inputSchema: { number: z.number() }
      },
      async ({ number }) => {
        console.log('number:', number)
        numberValue.value += number
        return { content: [{ type: 'text', text: `收到: ${numberValue.value}` }] }
      }
    )

    await server.connect(serverTransport)

    // 创建 WebMcpClient ，并与 WebAgent 连接
    const client = new WebMcpClient()
    await client.connect(clientTransport)
    const { sessionId: sessionID } = await client.connect({
      agent: true,

      // sessionId 为可选参数。若传入该参数，系统将使用指定值作为会话标识；若未传入，WebAgent 服务将自动生成一个随机的字符串作为 sessionId。为便于通过 MCP Inspector 工具进行调试，此处采用了固定的 sessionId。用户亦可通过浏览器原生提供的 crypto.randomUUID() 方法生成随机字符串作为会话标识。
      sessionId: 'd299a869-c674-4125-a84b-bb4e24079b99',

      url: 'http://localhost:3040/api/v1/webmcp/mcp'
    })
    sessionId.value = sessionID
    console.log('sessionId:', sessionId.value)
  })

  const theme = new TinyThemeTool();
  useTheme(theme);

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
  };
</script>

<style lang="less" scoped>
  @import '@/assets/style/menu.less'; /* 引入公共样式 */
</style>
