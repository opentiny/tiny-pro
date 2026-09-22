import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';

export interface ChatMessage {
  role: string;
  content: string;
}

@Injectable()
export class RobotService {
  private readonly logger = new Logger(RobotService.name);

  /**
   * 转发对话请求到 OpenAI 兼容的大模型服务（默认 DeepSeek）
   * extraBody 为厂商扩展参数（如通义千问的 enable_search），会与 LLM_EXTRA_BODY 环境变量合并
   */
  async chat(
    messages: ChatMessage[],
    model?: string,
    extraBody?: Record<string, unknown>,
  ): Promise<{ content: string }> {
    const baseUrl = process.env.LLM_BASE_URL || 'https://api.deepseek.com';
    const apiKey = process.env.LLM_API_KEY;
    const llmModel = model || process.env.LLM_MODEL || 'deepseek-chat';

    if (!apiKey) {
      throw new HttpException(
        '服务端未配置 LLM_API_KEY，请在 .env 中配置后重启服务',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    let mergedExtraBody: Record<string, unknown> = {};
    if (process.env.LLM_EXTRA_BODY) {
      try {
        mergedExtraBody = JSON.parse(process.env.LLM_EXTRA_BODY);
      } catch {
        throw new HttpException(
          'LLM_EXTRA_BODY 不是合法的 JSON 字符串',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
    mergedExtraBody = { ...mergedExtraBody, ...(extraBody ?? {}) };

    try {
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: llmModel,
          messages,
          ...mergedExtraBody,
        }),
      });
      const data: any = await response.json();
      if (!response.ok) {
        throw new HttpException(
          data?.error?.message || '大模型服务请求失败',
          HttpStatus.BAD_GATEWAY,
        );
      }
      return { content: data.choices[0].message.content };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(`调用大模型服务失败: ${error.message}`);
      throw new HttpException(
        '大模型服务连接失败，请检查 LLM_BASE_URL 与服务网络',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }
}
