import type { Server } from 'node:http';
import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { Writable } from 'node:stream';
import { ChatService } from '../chat.service';

interface CapturedRequest {
  url?: string;
  auth?: string;
  body?: Record<string, any>;
}

function startStub(
  mode: 'ok' | 'unauthorized' = 'ok'
): Promise<{ server: Server; captured: CapturedRequest; port: number }> {
  const captured: CapturedRequest = {};
  const server = createServer((req, res) => {
    let raw = '';
    req.on('data', (chunk) => (raw += chunk));
    req.on('end', () => {
      captured.url = req.url;
      captured.auth = req.headers.authorization;
      captured.body = JSON.parse(raw);
      if (mode === 'ok') {
        res.writeHead(200, { 'content-type': 'text/event-stream' });
        res.end(
          'data: {"id":"stub","choices":[{"index":0,"delta":{"role":"assistant","content":"ok"},"finish_reason":null}]}\n\n' +
            'data: [DONE]\n\n'
        );
      } else {
        res.writeHead(401, { 'content-type': 'application/json' });
        res.end(JSON.stringify({ error: { message: 'Invalid API-key' } }));
      }
    });
  });
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      resolve({ server, captured, port: (server.address() as AddressInfo).port });
    });
  });
}

function makeRes() {
  const chunks: string[] = [];
  const res = new Writable({
    write(chunk, _enc, cb) {
      (res as any).headersSent = true;
      chunks.push(chunk.toString());
      cb();
    },
  }) as Writable & {
    statusCode: number;
    headers: Record<string, string>;
    headersSent: boolean;
  };
  res.statusCode = 0;
  res.headers = {};
  res.headersSent = false;
  (res as any).status = (code: number) => {
    res.statusCode = code;
    return res;
  };
  (res as any).setHeader = (key: string, value: string) => {
    res.headers[key.toLowerCase()] = value;
  };
  return { res, chunks };
}

describe('ChatService.proxyChatCompletions', () => {
  const originalEnv = { ...process.env };
  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('应带服务端 key 转发请求、合并 LLM_EXTRA_BODY 并透传 SSE 流', async () => {
    const stub = await startStub('ok');
    process.env.LLM_BASE_URL = `http://127.0.0.1:${stub.port}/v1`;
    process.env.LLM_API_KEY = 'sk-test-key';
    process.env.LLM_MODEL = 'qwen-plus';
    process.env.LLM_EXTRA_BODY =
      '{"enable_search":true,"search_options":{"forced_search":true}}';

    const service = new ChatService();
    const { res, chunks } = makeRes();
    await service.proxyChatCompletions(
      { messages: [{ role: 'user', content: '你好' }], stream: true },
      res as any
    );

    expect(stub.captured.url).toBe('/v1/chat/completions');
    expect(stub.captured.auth).toBe('Bearer sk-test-key');
    expect(stub.captured.body?.model).toBe('qwen-plus');
    expect(stub.captured.body?.messages?.[0]?.content).toBe('你好');
    expect(stub.captured.body?.enable_search).toBe(true);
    expect(stub.captured.body?.search_options?.forced_search).toBe(true);

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toContain('text/event-stream');
    expect(chunks.join('')).toContain('data: [DONE]');
    stub.server.close();
  });

  it('未配置 LLM_API_KEY 时应抛出 500', async () => {
    delete process.env.LLM_API_KEY;
    const service = new ChatService();
    const { res } = makeRes();
    await expect(
      service.proxyChatCompletions({ messages: [] }, res as any)
    ).rejects.toMatchObject({ status: 500 });
  });

  it('上游返回错误时应包装为 502 并携带上游错误信息', async () => {
    const stub = await startStub('unauthorized');
    process.env.LLM_BASE_URL = `http://127.0.0.1:${stub.port}/v1`;
    process.env.LLM_API_KEY = 'sk-wrong-key';

    const service = new ChatService();
    const { res } = makeRes();
    await expect(
      service.proxyChatCompletions({ messages: [] }, res as any)
    ).rejects.toMatchObject({ status: 502 });
    stub.server.close();
  });

  it('LLM_EXTRA_BODY 非法 JSON 时应抛出 500', async () => {
    process.env.LLM_API_KEY = 'sk-test-key';
    process.env.LLM_EXTRA_BODY = '{invalid';
    const service = new ChatService();
    const { res } = makeRes();
    await expect(
      service.proxyChatCompletions({ messages: [] }, res as any)
    ).rejects.toMatchObject({ status: 500 });
  });

  it('客户端中途断开（前端暂停）时应中止上游请求并正常返回', async () => {
    let upstreamAborted = false;
    const server = createServer((req, res) => {
      res.writeHead(200, { 'content-type': 'text/event-stream' });
      res.write('data: {"chunk":1}\n\n');
      const timer = setInterval(() => res.write('data: {"chunk":2}\n\n'), 100);
      req.on('close', () => {
        upstreamAborted = true;
        clearInterval(timer);
        res.end();
      });
    });
    const port: number = await new Promise((resolve) => {
      server.listen(0, '127.0.0.1', () =>
        resolve((server.address() as AddressInfo).port)
      );
    });

    process.env.LLM_BASE_URL = `http://127.0.0.1:${port}/v1`;
    process.env.LLM_API_KEY = 'sk-test-key';
    delete process.env.LLM_EXTRA_BODY;

    const service = new ChatService();
    const { res, chunks } = makeRes();
    const pending = service.proxyChatCompletions(
      { messages: [{ role: 'user', content: 'hi' }], stream: true },
      res as any
    );

    // 收到首个 chunk 后模拟客户端断开
    for (let i = 0; i < 50 && chunks.length === 0; i++) {
      await new Promise((r) => setTimeout(r, 20));
    }
    expect(chunks.length).toBeGreaterThan(0);
    res.destroy();
    await pending;

    // 上游感知到连接断开是异步的，轮询等待
    for (let i = 0; i < 50 && !upstreamAborted; i++) {
      await new Promise((r) => setTimeout(r, 20));
    }
    expect(upstreamAborted).toBe(true);
    server.close();
  });
});
