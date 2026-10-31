import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import type { Response } from 'express';
import { Readable } from 'stream';

export interface ChatCompletionMessage {
  role: string;
  content: string;
}

export interface ChatCompletionRequest {
  model?: string;
  messages: ChatCompletionMessage[];
  stream?: boolean;
  [key: string]: unknown;
}

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  /**
   * 将前端的对话补全请求转发到 OpenAI 兼容的大模型服务（默认通义千问），
   * 原样回传 SSE 流；LLM_EXTRA_BODY 中的厂商扩展参数会与请求体合并
   */
  async proxyChatCompletions(
    body: ChatCompletionRequest,
    res: Response,
  ): Promise<void> {
    const baseUrl = (
      process.env.LLM_BASE_URL ||
      'https://dashscope.aliyuncs.com/compatible-mode/v1'
    ).replace(/\/+$/, '');
    const apiKey = process.env.LLM_API_KEY;
    const model = body.model || process.env.LLM_MODEL || 'qwen-plus';

    if (!apiKey) {
      throw new HttpException(
        '服务端未配置 LLM_API_KEY，请在 .env 中配置后重启服务',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    let extraBody: Record<string, unknown> = {};
    if (process.env.LLM_EXTRA_BODY) {
      try {
        extraBody = JSON.parse(process.env.LLM_EXTRA_BODY);
      } catch {
        throw new HttpException(
          'LLM_EXTRA_BODY 不是合法的 JSON 字符串',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }

    const { model: _model, ...rest } = body;

    // 客户端断开（如前端暂停）时中止上游请求，避免大模型继续生成计费
    const abortController = new AbortController();
    res.on('close', () => {
      if (!res.writableFinished) {
        abortController.abort();
      }
    });

    try {
      const upstream = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ ...rest, model, ...extraBody }),
        signal: abortController.signal,
      });

      if (!upstream.ok || !upstream.body) {
        const detail = await upstream.text().catch(() => '');
        throw new HttpException(
          detail || '大模型服务请求失败',
          HttpStatus.BAD_GATEWAY,
        );
      }

      res.status(upstream.status);
      res.setHeader(
        'Content-Type',
        upstream.headers.get('content-type') ?? 'text/event-stream',
      );
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('X-Accel-Buffering', 'no');
      // 等待流式传输结束；客户端中途断开等情况不抛出，避免影响已发送的响应
      await new Promise<void>((resolve) => {
        const upstreamStream = Readable.fromWeb(
          upstream.body as unknown as import('stream/web').ReadableStream,
        );
        res.on('close', () => {
          upstreamStream.destroy();
          resolve();
        });
        upstreamStream
          .on('error', () => resolve())
          .pipe(res)
          .on('error', () => resolve())
          .on('finish', resolve);
      });
    } catch (error) {
      // 响应已开始或连接已关闭（如客户端暂停后中止），无法也不再需要返回错误
      if (res.headersSent || res.closed) {
        this.logger.warn(`对话请求已中断: ${(error as Error).message}`);
        return;
      }
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(`调用大模型服务失败: ${(error as Error).message}`);
      throw new HttpException(
        '大模型服务连接失败，请检查 LLM_BASE_URL 与服务网络',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }
}
