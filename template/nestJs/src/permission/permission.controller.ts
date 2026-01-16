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
import { CreatePermissionDto } from './dto/create-permission.dto';
import { Permission } from '../public/permission.decorator';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { Reject } from '../public/reject.decorator';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { Permission as PermissionEntity } from '@app/models';
import { GetAllPermission } from './entity/get-all-permission.entry';

@Controller('permission')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @ApiOperation({summary: '创建一个权限字段'})
  @ApiCreatedResponse({
    description: '数据库记录',
    type: PermissionEntity
  })
  @Permission('permission::add')
  @Post()
  create(@Body() dto: CreatePermissionDto) {
    return this.permissionService.create(dto, false);
  }


  @ApiOperation({summary: '修改一个权限字段'})
  @Reject()
  @Patch()
  @Permission('permission::update')
  update(@Body() dto: UpdatePermissionDto) {
    return this.permissionService.updatePermission(dto);
  }

  @ApiOperation({summary: '分页查询权限'})
  @ApiQuery({name: 'page', description: '页码, 必须是一个正整数'})
  @ApiQuery({name: 'limit', description: '页大小, 必须是一个正整数'})
  @ApiQuery({name: 'name', description: '模糊查找条件'})
  @ApiOkResponse({type: GetAllPermission })
  @Get()
  @Permission('permission::get')
  find(
    @Query('page', new DefaultValuePipe('1'), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe('0'), ParseIntPipe) limit: number,
    @Query('name') name?: string
  ) {
    return this.permissionService.findPermission(page, limit, name);
  }

  @ApiOperation({summary: '删除权限字段'})
  @ApiParam({name: 'id', description: '你想删除的权限字段的数据库主键'})
  @ApiOkResponse({type: PermissionEntity })
  @Reject()
  @Delete('/:id')
  @Permission('permission::remove')
  del(@Param('id') id: number) {
    return this.permissionService.delPermission(id);
  }
}
