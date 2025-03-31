import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import { MockService } from './mock.service';
import { Public } from '../public/public.decorator';
import { MockDto } from './mock.dto';
import { Request } from 'express';
import data from './data';

@Controller('mock')
export class MockController {
  constructor(private readonly mockService: MockService) {}

  @Get('*')
  async getMock(@Req() req: Request) {
    const path = req.path.replace('/mock', '');
    const item = data.filter(
      (dataItem) => dataItem.method === 'get' && dataItem.url === path
    );
    if (!item.length) {
      throw new HttpException('not found', HttpStatus.NOT_FOUND);
    }
    return item[0].response({ body: null });
  }

  @Post('*')
  async postMock(@Req() req: Request) {
    const path = req.path.replace('/mock', '');
    const item = data.filter(
      (dataItem) => dataItem.method === 'post' && dataItem.url === path
    );
    if (!item.length) {
      throw new HttpException('not found', HttpStatus.NOT_FOUND);
    }
    return item[0].response({ body: req.body });
  }
}
