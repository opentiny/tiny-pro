import { Controller, Get, Query } from '@nestjs/common';
import { ApplicationService } from './application.service';
import {
  FindApplicationEntity,
  FindApplicationsRequest,
} from './dto/find-applications';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';

@Controller('application')
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  @ApiOperation({ summary: '获取应用' })
  @ApiOkResponse({
    type: FindApplicationEntity,
  })
  @Get()
  async getAllApplication(@Query() searchInfo: FindApplicationsRequest) {
    return this.applicationService.findAllAplication(searchInfo);
  }
}
