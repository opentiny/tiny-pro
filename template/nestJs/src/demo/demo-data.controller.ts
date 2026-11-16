import { Body, Controller, Get, Post } from '@nestjs/common';
import { successResponseWrap } from '../mock/utils';
import { Reject } from '../public/reject.decorator';
import { DemoDataService } from './demo-data.service';

@Controller()
export class DemoDataController {
  constructor(private readonly demoDataService: DemoDataService) {}

  @Get('board/home')
  getBoardHome() {
    return this.demoDataService.getBoardHome();
  }

  @Get('user/getdata')
  async getUserData() {
    return successResponseWrap(await this.demoDataService.getWorkPlan());
  }

  @Get('user/getrpractic')
  async getUserPractice() {
    return successResponseWrap(await this.demoDataService.getWorkPractice());
  }

  @Get('user/getrtrain')
  getUserTrain() {
    return this.demoDataService.getWorkTraining();
  }

  @Post('user/getselect')
  async getUserSelect(@Body() body: unknown) {
    const data = await this.demoDataService.getWorkPracticeChart();
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
    return successResponseWrap(await this.demoDataService.getBaseForm());
  }

  @Get('step/getdata')
  async getStepData() {
    return successResponseWrap(await this.demoDataService.getStepForm());
  }

  @Get('advance/getdata')
  async getAdvanceData() {
    return successResponseWrap(await this.demoDataService.getAdvanceForm());
  }

  @Reject()
  @Post('channel-form/submit')
  async submitStepForm(@Body() body: { data?: Record<string, unknown> }) {
    await this.demoDataService.saveSubmission(body?.data ?? {});
    return successResponseWrap('ok');
  }

  @Get('detail/getdata')
  async getDetailData() {
    return successResponseWrap(await this.demoDataService.getProfileDetail());
  }
}
