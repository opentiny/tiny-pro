import type { MockMethod } from './server'

interface ChatMessage {
  role: string
  content: string
}

export default [
  {
    method: 'post',
    url: '/api/robot/chat',
    response: ({ body }) => {
      const messages = (body as { messages?: ChatMessage[] })?.messages ?? []
      const question = [...messages].reverse().find(item => item.role === 'user')?.content ?? ''
      return {
        content: `[Mock模式] 已收到你的问题：“${question}”。当前为前端 mock 数据，使用真实后端（VITE_USE_MOCK=false）并配置大模型后将返回真实回答。`,
      }
    },
  },
] as MockMethod[]
