import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { FindRoleResponse } from './dto/find-role.dto';
import { RoleInfo } from './dto/role-info';
import { FindAllRoleItem } from './dto/find-all-role.dto';
import { GetRoleDetail } from './dto/get-role-detail.dto';
import type { RoleId } from './role.entity';

@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @ApiOperation({ summary: '创建一个角色' })
  @ApiCreatedResponse({
    type: RoleInfo,
  })
  @Post()
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.roleService.createRole(createRoleDto);
  }

  @ApiOperation({ summary: '查询所有的角色' })
  @ApiOkResponse({
    type: [FindAllRoleItem],
  })
  @Get()
  getAllRole() {
    return this.roleService.findAll();
  }

  @ApiQuery({
    name: 'page',
    description: '页码',
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    description: '单页大小',
    type: Number,
  })
  @ApiQuery({
    name: 'name',
    required: false,
    description: '角色名. 传入则会模糊搜索角色名',
    type: String,
  })
  @ApiOperation({ summary: '分页查询角色' })
  @ApiOkResponse({ type: GetRoleDetail })
  @Get('/detail')
  getAllRoleDetail(
    @Query('page', new DefaultValuePipe('1'), ParseIntPipe) page?: number,
    @Query(
      'limit',
      new DefaultValuePipe(process.env.PAGINATION_LIMIT),
      ParseIntPipe,
    )
    limit?: number,
    @Query('name') name?: string,
  ) {
    return this.roleService.findAllDetail(page, limit, name);
  }

  @ApiOperation({ summary: '修改角色信息' })
  @ApiOkResponse({
    type: [RoleInfo],
  })
  @Patch()
  updateRole(@Body() dto: UpdateRoleDto) {
    return this.roleService.updateRole(dto);
  }

  @ApiOperation({ summary: '删除角色' })
  @ApiOkResponse({
    type: [RoleInfo],
  })
  @ApiParam({
    type: Number,
    description: '角色ID',
    name: 'id',
  })
  @Delete('/:id')
  deleteRole(@Param('id') id: RoleId) {
    return this.roleService.remove(id);
  }

  @ApiOperation({ summary: '获取角色信息' })
  @ApiParam({
    type: Number,
    description: '角色ID',
    name: 'id',
  })
  @ApiOkResponse({
    type: FindRoleResponse,
  })
  @Get('/info/:id')
  getRoleInfo(@Param('id') id: RoleId) {
    return this.roleService.findRole(id);
  }
}
