import { Controller, Get, Query } from '@nestjs/common';
import { ApplicationService } from './application.service';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { FindApplicationEntity } from './entites/find-application.entity';

@Controller('application')
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  @ApiOperation({summary: '获取应用'})
  @ApiOkResponse({
    type: FindApplicationEntity
  })
  @Get()
  async getAllApplication(@Query() searchInfo: PaginationQueryDto) {
    return this.applicationService.findAllApplication(searchInfo);
  }
}
