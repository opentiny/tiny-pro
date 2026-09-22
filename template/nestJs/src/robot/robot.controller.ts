import { Body, Controller, Post } from '@nestjs/common';
import { ChatMessage, RobotService } from './robot.service';

@Controller('robot')
export class RobotController {
  constructor(private readonly robotService: RobotService) {}

  @Post('chat')
  chat(
    @Body()
    body: { messages: ChatMessage[], model?: string, extraBody?: Record<string, unknown> },
  ) {
    return this.robotService.chat(body.messages, body.model, body.extraBody);
  }
}
