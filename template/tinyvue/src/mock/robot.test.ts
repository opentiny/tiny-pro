import assert from 'node:assert/strict'
// eslint-disable-next-line test/no-import-node-test
import test from 'node:test'
import robot from './robot'
import { dispatchMockRequest } from './server'

test('POST /api/robot/chat/completions returns an OpenAI-compatible SSE stream', async () => {
  const result = await dispatchMockRequest(robot, {
    method: 'post',
    url: '/api/robot/chat/completions',
    body: {
      model: 'qwen-plus',
      messages: [{ role: 'user', content: '今天北京天气如何？' }],
      stream: true,
    },
  })

  assert.equal(result.statusCode, 200)
  assert.match(result.headers?.['content-type'] ?? '', /text\/event-stream/)

  const text = result.body as string
  assert.ok(text.includes('data: [DONE]'))
  assert.match(text, /今天北京天气如何？/)

  for (const line of text.split('\n')) {
    if (line.startsWith('data: ') && line !== 'data: [DONE]') {
      const chunk = JSON.parse(line.slice('data: '.length))
      assert.equal(chunk.object, 'chat.completion.chunk')
      assert.ok(Array.isArray(chunk.choices))
    }
  }
})

test('POST /api/robot/chat/completions handles empty messages', async () => {
  const result = await dispatchMockRequest(robot, {
    method: 'post',
    url: '/api/robot/chat/completions',
    body: {},
  })

  assert.equal(result.statusCode, 200)
  assert.ok((result.body as string).includes('data: [DONE]'))
})
