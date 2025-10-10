import { Controller, Get } from '@nestjs/common';
import { Public} from './public/public.decorator';

@Controller('healthCheck')
export class HealthCheckController {
  @Public()
  @Get()
  getEmptyResponse(): string {
    return 'success'; // 确保健康检查能通过：`curl -k 127.0.0.1:3000/healthCheck` 获取到内容，而不是 404
  }
}
