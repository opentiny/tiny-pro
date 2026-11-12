import {
  Body,
  Controller,
  Get,
  Post,
} from '@nestjs/common';
import { successResponseWrap } from '../mock/utils';
import { Reject } from '../public/reject.decorator';
import { DemoDataService } from './demo-data.service';

@Controller()
export class DemoDataController {
  constructor(private readonly demoDataService: DemoDataService) {}

  @Get('board/home')
  getBoardHome() {
    return this.demoDataService.get('board-home');
  }

  @Get('user/getdata')
  async getUserData() {
    return successResponseWrap(await this.demoDataService.get('work-data'));
  }

  @Get('user/getrpractic')
  async getUserPractice() {
    return successResponseWrap(await this.demoDataService.get('work-practice'));
  }

  @Get('user/getrtrain')
  getUserTrain() {
    return this.demoDataService.get('work-train');
  }

  @Post('user/getselect')
  async getUserSelect(@Body() body: unknown) {
    const data = await this.demoDataService.get<{
      options1: number[];
      options2: number[];
      options3: number[];
    }>('work-select');
    const selected = String(
      typeof body === 'object' && body !== null && 'value' in body
        ? body.value
        : body ?? ''
    );
    const result =
      selected === '1'
        ? data.options1
        : selected === '2'
          ? data.options2
          : data.options3;
    return successResponseWrap(result);
  }

  @Post('user/data')
  getUserCenterData(@Body() body: Record<string, unknown>) {
    return this.demoDataService.getUserCenterData(body);
  }

  @Get('base/getdata')
  async getBaseData() {
    return successResponseWrap(await this.demoDataService.get('form-options'));
  }

  @Get('step/getdata')
  async getStepData() {
    return successResponseWrap(await this.demoDataService.get('form-options'));
  }

  @Get('advance/getdata')
  async getAdvanceData() {
    return successResponseWrap(await this.demoDataService.get('form-options'));
  }

  @Reject()
  @Post('channel-form/submit')
  async submitStepForm(@Body() body: { data?: Record<string, unknown> }) {
    await this.demoDataService.saveSubmission(body?.data ?? {});
    return successResponseWrap('ok');
  }

  @Get('detail/getdata')
  async getDetailData() {
    return successResponseWrap(await this.demoDataService.get('profile-detail'));
  }
}
