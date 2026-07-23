import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import data from './data';

@Controller('mock')
export class MockController {
  @Get('*path')
  getMock(@Req() req: Request) {
    const path = req.path.replace('/mock', '');
    const item = data.filter(
      (dataItem) => dataItem.method === 'get' && dataItem.url === path,
    );
    if (!item.length) {
      throw new HttpException('not found', HttpStatus.NOT_FOUND);
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return item[0].response({ body: null });
  }

  @Post('*path')
  postMock(@Req() req: Request) {
    const path = req.path.replace('/mock', '');
    const item = data.filter(
      (dataItem) => dataItem.method === 'post' && dataItem.url === path,
    );
    if (!item.length) {
      throw new HttpException('not found', HttpStatus.NOT_FOUND);
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return item[0].response({ body: req.body });
  }
}
