import type { IncomingHttpHeaders } from 'node:http'
import { Buffer } from 'node:buffer'
import { createServer } from 'node:http'

export interface MockRequest {
  method: string
  url: string
  body?: unknown
  headers?: Record<string, string> | IncomingHttpHeaders
}

export interface MockHandlerContext {
  body: any
  headers: Record<string, string> | IncomingHttpHeaders
  params: Record<string, string>
  query: URLSearchParams
}

export interface MockMethod {
  method?: string
  url: string
  response: (context: MockHandlerContext) => unknown | Promise<unknown>
}

export interface MockDispatchResult {
  body: unknown
  statusCode: number
}

class MockHttpResponse {
  constructor(
    readonly statusCode: number,
    readonly body: unknown,
  ) {}
}

export function mockHttpResponse(statusCode: number, body: unknown) {
  return new MockHttpResponse(statusCode, body)
}

function matchPath(pattern: string, pathname: string) {
  const names: string[] = []
  const segments = pattern.split('/').filter(Boolean)
  let source = '^'

  for (const segment of segments) {
    if (segment.startsWith(':')) {
      const optional = segment.endsWith('?')
      const name = segment.slice(1, optional ? -1 : undefined)
      names.push(name)
      source += optional ? '(?:/([^/]+))?' : '/([^/]+)'
    }
    else {
      source += `/${segment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`
    }
  }

  const match = pathname.match(new RegExp(`${source}/?$`))
  if (!match) {
    return null
  }

  return Object.fromEntries(
    names.map((name, index) => [name, decodeURIComponent(match[index + 1] ?? '')]),
  )
}

export async function dispatchMockRequest(
  mocks: MockMethod[],
  request: MockRequest,
): Promise<MockDispatchResult> {
  const url = new URL(request.url, 'http://mock.local')
  const method = request.method.toLowerCase()

  for (const mock of mocks) {
    if ((mock.method ?? 'get').toLowerCase() !== method) {
      continue
    }
    const params = matchPath(mock.url, url.pathname)
    if (!params) {
      continue
    }

    const body = await mock.response({
      body: request.body,
      headers: request.headers ?? {},
      params,
      query: url.searchParams,
    })
    if (body instanceof MockHttpResponse) {
      return { body: body.body, statusCode: body.statusCode }
    }
    return { body, statusCode: 200 }
  }

  return { body: { message: 'Mock route not found' }, statusCode: 404 }
}

async function readBody(request: AsyncIterable<Buffer>) {
  const chunks: Buffer[] = []
  for await (const chunk of request) {
    chunks.push(Buffer.from(chunk))
  }
  if (!chunks.length) {
    return undefined
  }
  const content = Buffer.concat(chunks).toString('utf8')
  return content ? JSON.parse(content) : undefined
}

export function startMockServer(
  mocks: MockMethod[],
  { hostname = '127.0.0.1', port = 8848 } = {},
) {
  const server = createServer(async (request, response) => {
    try {
      const result = await dispatchMockRequest(mocks, {
        method: request.method ?? 'get',
        url: request.url ?? '/',
        body: await readBody(request),
        headers: request.headers,
      })
      response.writeHead(result.statusCode, { 'content-type': 'application/json' })
      response.end(JSON.stringify(result.body))
    }
    catch (error) {
      response.writeHead(500, { 'content-type': 'application/json' })
      response.end(JSON.stringify({
        message: error instanceof Error ? error.message : 'Mock server error',
      }))
    }
  })

  return new Promise<typeof server>((resolve, reject) => {
    server.once('error', reject)
    server.listen(port, hostname, () => {
      server.off('error', reject)
      resolve(server)
    })
  })
}
