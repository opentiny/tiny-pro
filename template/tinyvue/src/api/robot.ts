import axios from 'axios'

export interface RobotChatMessage {
  role: string
  content: string
}

const DEFAULT_PROXY_URL = '/api/robot/chat'

/**
 * 解析 VITE_ROBOT_LLM_EXTRA_BODY（JSON 字符串），用于传入厂商扩展参数，
 * 如通义千问的联网搜索 {"enable_search":true}、Kimi 的 {"tools":[...]}
 */
function parseExtraBody(): Record<string, unknown> {
  const { VITE_ROBOT_LLM_EXTRA_BODY } = import.meta.env
  if (!VITE_ROBOT_LLM_EXTRA_BODY) {
    return {}
  }
  try {
    return JSON.parse(VITE_ROBOT_LLM_EXTRA_BODY)
  }
  catch {
    throw new Error('VITE_ROBOT_LLM_EXTRA_BODY 不是合法的 JSON 字符串')
  }
}

/**
 * 前端直连 OpenAI 兼容的大模型服务（key 暴露在前端，仅内网/demo 使用）
 */
async function chatDirect(messages: RobotChatMessage[]): Promise<string> {
  const {
    VITE_ROBOT_LLM_BASE_URL,
    VITE_ROBOT_LLM_API_KEY,
    VITE_ROBOT_LLM_MODEL,
  } = import.meta.env

  if (!VITE_ROBOT_LLM_API_KEY) {
    throw new Error('未配置 VITE_ROBOT_LLM_API_KEY，无法直连大模型服务')
  }

  const response = await fetch(`${VITE_ROBOT_LLM_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${VITE_ROBOT_LLM_API_KEY}`,
    },
    body: JSON.stringify({
      model: VITE_ROBOT_LLM_MODEL || 'deepseek-chat',
      messages,
      ...parseExtraBody(),
    }),
  })
  const data = await response.json()
  if (!response.ok) {
    throw new Error(data?.error?.message || '大模型服务请求失败')
  }
  return data.choices[0].message.content as string
}

/**
 * 通过后端代理调用大模型（key 留在服务端，推荐方式）
 */
async function chatViaProxy(messages: RobotChatMessage[]): Promise<string> {
  const {
    VITE_ROBOT_LLM_PROXY_URL,
    VITE_ROBOT_LLM_MODEL,
    VITE_ROBOT_LLM_EXTRA_BODY,
  } = import.meta.env
  const response = await axios.post(
    VITE_ROBOT_LLM_PROXY_URL || DEFAULT_PROXY_URL,
    {
      messages,
      model: VITE_ROBOT_LLM_MODEL || 'deepseek-chat',
      extraBody: VITE_ROBOT_LLM_EXTRA_BODY
        ? parseExtraBody()
        : undefined,
    },
  )
  return response.data?.content ?? response.data
}

/**
 * 按 dev.env 中的 VITE_ROBOT_LLM_MODE 选择调用方式：
 * proxy（默认）= 走后端代理；direct = 前端直连
 */
export async function chatWithRobot(
  messages: RobotChatMessage[],
): Promise<string> {
  const { VITE_ROBOT_LLM_MODE } = import.meta.env
  if (VITE_ROBOT_LLM_MODE === 'direct') {
    return chatDirect(messages)
  }
  return chatViaProxy(messages)
}
