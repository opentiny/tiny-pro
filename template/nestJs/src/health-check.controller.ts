import { Controller, Get } from '@nestjs/common';
import { Public} from './public/public.decorator';
import { ApiOkResponse } from '@nestjs/swagger';

@Controller('healthCheck')
export class HealthCheckController {
  @ApiOkResponse({
    type: 'string',
    description: '确保健康检查能通过：`curl -k 127.0.0.1:3000/healthCheck` 获取到内容，而不是 404',
    example: 'success'
  })
  @Public()
  @Get()
  getEmptyResponse(): string {
    return 'success';
  }
}
