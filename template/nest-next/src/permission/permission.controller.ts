import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { PermissionService } from './permission.service';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import {
  CreatePermissionDto,
  CreatePermissionResponse,
} from './dto/create-permission.dto';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { RemovePermissionResponse } from './dto/remove-permission.dto';
import { Reject } from '@app/shared/decorator';
import type { PermissionId } from './permission.entry';

@Controller('permission')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @ApiOperation({ summary: '创建一个权限字段' })
  @ApiCreatedResponse({
    description: '创建的权限',
    type: CreatePermissionResponse,
  })
  @Post('')
  create(@Body() dto: CreatePermissionDto) {
    return this.permissionService.create(dto);
  }

  @ApiOperation({ summary: '修改一个权限字段' })
  @Patch()
  update(@Body() dto: UpdatePermissionDto) {
    return this.permissionService.updatePermission(dto);
  }

  @ApiOperation({ summary: '分页查询权限' })
  @ApiQuery({ name: 'page', description: '页码, 必须是一个正整数' })
  @ApiQuery({ name: 'limit', description: '页大小, 必须是一个正整数' })
  @ApiQuery({ name: 'name', description: '模糊查找条件' })
  @Get()
  findAllPermission(
    @Query('page', new DefaultValuePipe('1'), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe('0'), ParseIntPipe) limit: number,
    @Query('name') name?: string,
  ) {
    return this.permissionService.findAllPermission(page, limit, name);
  }

  @ApiOperation({ summary: '删除权限字段' })
  @ApiParam({ name: 'id', description: '你想删除的权限字段的数据库主键' })
  @ApiOkResponse({ type: RemovePermissionResponse })
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: PermissionId) {
    return this.permissionService.remove(id);
  }
}
