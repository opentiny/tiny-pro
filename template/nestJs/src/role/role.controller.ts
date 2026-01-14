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
import { Permission } from '../public/permission.decorator';
import { Reject } from '../public/reject.decorator';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { Role } from '@app/models';
import { GetAllRoleDetail } from './entities/get-all-role-detail.entity';


@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @ApiOperation({summary: '创建一个角色'})
  @ApiCreatedResponse({
    type: Role,
  })
  @Permission('role::add')
  @Post()
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.roleService.create(createRoleDto, false);
  }

  @ApiOperation({summary: '查询所有的角色'})
  @ApiOkResponse({
    type: [Role]
  })
  @Permission('role::query')
  @Get()
  getAllRole() {
    return this.roleService.findAll();
  }

  @ApiQuery({
    name: 'page',
    description: '页码',
    type: Number
  })
  @ApiQuery({
    name: 'limit',
    description: '单页大小',
    type: Number
  })
  @ApiQuery({
    name: 'name',
    required: false,
    description: '角色名. 传入则会模糊搜索角色名',
    type: String
  })
  @ApiOperation({summary: '分页查询角色'})
  @ApiOkResponse({type: GetAllRoleDetail})
  @Permission('role::query')
  @Get('/detail')
  getAllRoleDetail(
    @Query('page', new DefaultValuePipe('1'), ParseIntPipe) page?: number,
    @Query(
      'limit',
      new DefaultValuePipe(process.env.PAGINATION_LIMIT),
      ParseIntPipe
    )
    limit?: number,
    @Query('name') name?: string
  ) {
    return this.roleService.findAllDetail(page, limit, name);
  }

  @ApiOperation({summary: '修改角色信息'})
  @ApiOkResponse({
    type: Role
  })
  @Reject()
  @Patch()
  @Permission('role::update')
  updateRole(@Body() dto: UpdateRoleDto) {
    return this.roleService.update(dto);
  }

  @ApiOperation({summary: '删除角色'})
  @ApiOkResponse({
    type: [Role]
  })
  @ApiParam({
    type: Number,
    description: '角色ID',
    name: 'id'
  })
  @Reject()
  @Delete('/:id')
  @Permission('role::remove')
  deleteRole(@Param('id') id: number) {
    return this.roleService.delete(id);
  }


  @ApiOperation({summary: '获取角色信息'})
  @ApiParam({
    type: Number,
    description: '角色ID',
    name: 'id'
  })
  @ApiOkResponse({
    type: Role
  })
  @Get('/info/:id')
  getRoleInfo(@Param('id') id: string) {
    return this.roleService.findOne(id);
  }
}
