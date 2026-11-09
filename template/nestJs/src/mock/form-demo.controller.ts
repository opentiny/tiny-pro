import { Controller, Get } from '@nestjs/common';
import { initBase } from './data/forms';
import { successResponseWrap } from './utils';

// 表单页（基础/分步/高级）的演示数据接口。
// 联调模式下前端统一请求 /api/{base,step,advance}/getdata，
// dev proxy 剥掉 /api 前缀后以 /base/getdata 等形式到达这里，
// 数据与 mock 服务（MockController / 8848）提供的保持一致
@Controller()
export class FormDemoController {
  @Get('base/getdata')
  getBaseData() {
    return successResponseWrap(initBase);
  }

  @Get('step/getdata')
  getStepData() {
    return successResponseWrap(initBase);
  }

  @Get('advance/getdata')
  getAdvanceData() {
    return successResponseWrap(initBase);
  }
}
