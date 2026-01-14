import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Query,
  Delete,
  Param,
} from '@nestjs/common';
import { MenuService } from './menu.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { Permission } from '../public/permission.decorator';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { Reject } from '../public/reject.decorator';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { TreeNode } from './entity/tree-node.entity';
import { Menu } from '@app/models';

@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @ApiOperation({summary: '获取某个用户绑定的角色菜单树'})
  @ApiParam({name: 'email', description: '用户的电子邮箱'})
  @ApiOkResponse({type: [TreeNode]})
  @Get('/role/:email')
  async getMenus(@Param('email') email: string) {
    return this.menuService.findRoleMenu(email);
  }


  @ApiOperation({summary: '获取完整的菜单树'})
  @ApiOkResponse({type: [TreeNode]})
  @Get()
  @Permission('menu::query')
  async getAllMenus() {
    return this.menuService.findAllMenu();
  }


  @ApiOperation({summary: '添加一个菜单'})
  @ApiCreatedResponse({type: Menu})
  @Post()
  @Permission('menu::add')
  async createMenu(@Body() dto: CreateMenuDto) {
    return this.menuService.createMenu(dto, false);
  }

  @ApiOperation({summary: '菜单修改'})
  @ApiOkResponse({type: Boolean})
  @Reject()
  @Patch()
  @Permission('menu::update')
  async updateMenu(@Body() dto: UpdateMenuDto) {
    return this.menuService.updateMenu(dto);
  }

  @ApiOperation({summary: '删除菜单'})
  @ApiQuery({name: 'id', description: '菜单id'})
  @ApiQuery({name: 'parentId', description: '菜单父级ID'})
  @ApiOkResponse({type: Menu})
  @Reject()
  @Delete()
  @Permission('menu::remove')
  async deleteMenu(
    @Query('id') id: number,
    @Query('parentId') parentId: number
  ) {
    return this.menuService.deleteMenu(id, parentId);
  }
}
