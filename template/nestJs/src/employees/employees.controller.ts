import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { EmployeeQueryBody } from './dto/employee-query.dto';
import { Employee } from './entities/employee.entity';
import { EmployeesService } from './employees.service';
import { successResponseWrap } from '../mock/utils';
import { Reject } from '../public/reject.decorator';

// 与前端 src/api/list.ts 的四个接口一一对应，
// 响应统一为 successResponseWrap 信封（页面按 { data } 解包）
@Controller('employee')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Post('getEmployee')
  async getEmployee(@Body() body: EmployeeQueryBody) {
    return successResponseWrap(await this.employeesService.queryPage(body));
  }

  @Post('getEmployeeInfo')
  async getEmployeeInfo(@Body() body: { id?: string }) {
    return successResponseWrap(
      await this.employeesService.findOne(String(body?.id ?? ''))
    );
  }

  @Reject()
  @Post('updateEmployeeInfo')
  async updateEmployeeInfo(@Body() body: { data?: Partial<Employee> }) {
    return successResponseWrap(
      await this.employeesService.update(body?.data ?? {})
    );
  }

  @Reject()
  @Delete('delete')
  async remove(@Query('id') id: string) {
    return successResponseWrap(await this.employeesService.remove(id));
  }

  @Get('getEmployee/:id')
  async findOne(@Param('id') id: string) {
    return successResponseWrap(await this.employeesService.findOne(id));
  }
}
