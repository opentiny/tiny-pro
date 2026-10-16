import type { ChatMcpServers, ChatProviderConfig } from '@opentiny/tiny-robot-chat'
import { IconBailian } from '@opentiny/tiny-robot-svgs'
import { getToken } from '@/utils/auth'

export interface McpExample {
  id: string
  title: string
  request: string
}

export const mcpExamples: McpExample[] = [
  { id: 'weather', title: '查询北京天气', request: '查询北京今天的天气，并给出出行建议' },
  { id: 'coffee', title: '查询附近咖啡店', request: '查询我附近的咖啡店，并按距离排序' },
  { id: 'exchange-rate', title: '获取当前汇率', request: '查询人民币兑美元的当前汇率' },
]

export const mcpServers: ChatMcpServers = [
  {
    id: 'amap-maps',
    name: '高德地图',
    description: '覆盖地图、导航、地理编码、天气、路径规划、距离测量、关键词搜索和周边搜索等地理信息服务。',
    baseUrl: import.meta.env.VITE_AMAP_MCP_URL?.trim() || 'https://dashscope.aliyuncs.com/api/v1/mcps/amap-maps/mcp',
    icon: 'https://img.alicdn.com/imgextra/i4/O1CN01iPPabT1EGRN6uatHP_!!6000000000324-0-tps-512-512.jpg',
    headers: import.meta.env.VITE_ALIYUN_DASHSCOPE_KEY?.trim()
      ? { Authorization: `Bearer ${import.meta.env.VITE_ALIYUN_DASHSCOPE_KEY.trim()}` }
      : undefined,
  },
  {
    id: 'modelcontextprotocol-mcp',
    name: 'Model Context Protocol MCP',
    description: 'MCP Server',
    baseUrl: '/modelcontextprotocol-mcp',
    installed: true,
  },
]

/**
 * 对话请求统一走 NestJS 后端代理（POST /robot/chat/completions，SSE 流式），
 * 大模型 API Key 只保留在服务端，前端凭登录态访问。
 * 开发环境由 vite dev proxy 将 VITE_BASE_API 转发到 nestJs 服务。
 */
const CHAT_COMPLETIONS_URL = new URL(
  `${import.meta.env.VITE_BASE_API || '/api'}/robot/chat/completions`,
  window.location.origin,
).toString()

export const modelProviders: ChatProviderConfig[] = [
  {
    type: 'qwen',
    label: 'TinyRobot 助手',
    apiUrl: CHAT_COMPLETIONS_URL,
    apiKey: getToken() ?? '',
    models: [
      {
        id: 'qwen-plus',
        label: 'Qwen Plus',
        icon: IconBailian,
        capabilities: { thinking: true, search: true },
      },
      {
        id: 'qwen-turbo',
        label: 'Qwen Turbo',
        icon: IconBailian,
        capabilities: { thinking: true, search: true },
      },
      {
        id: 'qwen-max',
        label: 'Qwen Max',
        icon: IconBailian,
        capabilities: { thinking: true, search: true },
      },
    ],
  },
]
