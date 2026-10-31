import { Body, Controller, Logger, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ChatCompletionRequest, ChatService } from './chat.service';

@Controller('robot')
export class ChatController {
  private readonly logger = new Logger(ChatController.name);

  constructor(private readonly chatService: ChatService) {}

  /**
   * 转发 OpenAI 兼容的对话补全请求（SSE 流式），
   * LLM_API_KEY 只留在服务端，前端通过登录态访问本接口
   */
  @Post('chat/completions')
  completions(
    @Body() body: ChatCompletionRequest,
    @Res() res: Response,
  ) {
    const lastUserMessage = [...(body.messages ?? [])]
      .reverse()
      .find(item => item.role === 'user');
    this.logger.log(
      `收到对话请求: model=${body.model || '默认'} messages=${body.messages?.length ?? 0}条`
      + ` 问题="${(lastUserMessage?.content ?? '').slice(0, 50)}"`,
    );
    return this.chatService.proxyChatCompletions(body, res);
  }
}
