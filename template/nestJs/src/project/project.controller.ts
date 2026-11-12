import {
  Body,
  Controller,
  Delete,
  Post,
  Query,
} from '@nestjs/common';
import { successResponseWrap } from '../mock/utils';
import { Reject } from '../public/reject.decorator';
import { Project } from './entities/project.entity';
import { ProjectService } from './project.service';

@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post('getProjectList')
  async getProjectList() {
    return successResponseWrap(await this.projectService.findAll());
  }

  @Reject()
  @Post('create')
  async create(@Body() body: { data?: Partial<Project> }) {
    return successResponseWrap(
      await this.projectService.create(body?.data ?? {})
    );
  }

  @Reject()
  @Post('update')
  async update(@Body() body: { data?: Partial<Project> }) {
    return successResponseWrap(
      await this.projectService.update(body?.data ?? {})
    );
  }

  @Reject()
  @Delete('delete')
  async remove(@Query('id') id: string) {
    return successResponseWrap(await this.projectService.remove(id));
  }
}
