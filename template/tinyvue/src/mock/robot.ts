import type { MockMethod } from './dispatch'
import { mockHttpResponse } from './dispatch'

interface ChatMessage {
  role: string
  content: string
}

/**
 * 将回复内容包装为 OpenAI 兼容的 SSE 流（tiny-robot-chat 按 stream: true 解析）
 */
function buildSseStream(content: string): string {
  const chunk = {
    id: 'chatcmpl-tiny-pro-mock',
    object: 'chat.completion.chunk',
    created: Math.floor(Date.now() / 1000),
    choices: [
      { index: 0, delta: { role: 'assistant', content }, finish_reason: null },
    ],
  }
  const stop = {
    id: 'chatcmpl-tiny-pro-mock',
    object: 'chat.completion.chunk',
    created: chunk.created,
    choices: [
      { index: 0, delta: {}, finish_reason: 'stop' },
    ],
  }
  return `data: ${JSON.stringify(chunk)}\n\n`
    + `data: ${JSON.stringify(stop)}\n\n`
    + 'data: [DONE]\n\n'
}

export default [
  {
    method: 'post',
    url: '/api/robot/chat/completions',
    response: ({ body }) => {
      const messages = (body as { messages?: ChatMessage[] })?.messages ?? []
      const question = [...messages].reverse().find(item => item.role === 'user')?.content ?? ''
      const answer = `[Mock 模式] 已收到你的问题：“${question}”。`
        + '当前为前端 mock 数据：联网搜索等真实能力需要集成 NestJS 服务端'
        + '（重新执行 tiny init pro 并选择集成 Nest.js），并在 nestJs/.env 配置 LLM_API_KEY。'
      return mockHttpResponse(200, buildSseStream(answer), {
        'content-type': 'text/event-stream; charset=utf-8',
      })
    },
  },
] as MockMethod[]
