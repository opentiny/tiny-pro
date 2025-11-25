import { Controller, Get, Query } from '@nestjs/common';
import { ApplicationService } from './application.service';
import { PaginationQueryDto } from './dto/pagination-query.dto';

@Controller('application')
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  @Get()
  async getAllApplication(@Query() searchInfo: PaginationQueryDto) {
    return this.applicationService.findAllApplication(searchInfo);
  }
}
