<template>
  <div>
    <tiny-config-provider :design="design">
      <router-view />
    </tiny-config-provider>

    <global-setting />
  </div>
  <tiny-remoter
    agent-root="https://agent.opentiny.design/api/v1/webmcp-trial/"
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
</template>

<script lang="ts" setup>
  import { onMounted, provide, ref } from 'vue';
  import { TinyConfigProvider } from '@opentiny/vue';
  import GlobalSetting from '@/components/global-setting/index.vue';
  import { createMessageChannelPairTransport, WebMcpClient } from '@opentiny/next-sdk'
  import { TinyRemoter } from '@opentiny/next-remoter'
  import TinyThemeTool from '@opentiny/vue-theme/theme-tool';
  import { useTheme } from './hooks/useTheme';
  import '@opentiny/next-remoter/dist/style.css'

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

  const sessionId = ref('')
  onMounted(async () => {
    const [serverTransport, clientTransport] = createMessageChannelPairTransport()

    provide('serverTransport', serverTransport)

    // 创建 WebMcpClient ，并与 WebAgent 连接
    const client = new WebMcpClient()
    await client.connect(clientTransport)
    const { sessionId: sessionID } = await client.connect({
      agent: true,

      // sessionId 为可选参数。若传入该参数，系统将使用指定值作为会话标识；若未传入，WebAgent 服务将自动生成一个随机的字符串作为 sessionId。为便于通过 MCP Inspector 工具进行调试，此处采用了固定的 sessionId。用户亦可通过浏览器原生提供的 crypto.randomUUID() 方法生成随机字符串作为会话标识。
      sessionId: 'd299a869-c674-4125-a84b-bb4e24079b99',

      url: 'https://agent.opentiny.design/api/v1/webmcp-trial/mcp' // http://localhost:3005/api/v1/webmcp/mcp
    })
    sessionId.value = sessionID
    console.log('sessionId:', sessionId.value)
  })
</script>

<style lang="less" scoped>
  @import '@/assets/style/menu.less'; /* 引入公共样式 */
</style>
