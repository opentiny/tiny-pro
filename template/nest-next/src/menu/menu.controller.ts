import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Query,
  Param,
} from '@nestjs/common';
import { MenuService } from './menu.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto, UpdateMenuResponse } from './dto/update-menu.dto';
import { MenuInfo } from './dto/menu-info.dto';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { TreeNode } from './types/tree-node';
import type { MenuId } from './menu.entity';
import { Permission, Reject } from '@app/shared';

@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @ApiOperation({ summary: '获取某个用户绑定的角色菜单树' })
  @ApiParam({ name: 'email', description: '用户的电子邮箱' })
  @ApiOkResponse({ type: [TreeNode] })
  @Get('/role/:email')
  async getMenus(@Param('email') email: string) {
    return this.menuService.findUserMenu(email);
  }

  @ApiOperation({ summary: '添加一个菜单' })
  @ApiCreatedResponse({ type: MenuInfo })
  @Post()
  @Permission('menu::query')
  create(@Body() createMenuDto: CreateMenuDto) {
    return this.menuService.create(createMenuDto);
  }

  @ApiOperation({ summary: '获取完整的菜单树' })
  @ApiOkResponse({ type: [TreeNode] })
  @Get()
  @Permission('menu::add')
  findAll() {
    return this.menuService.findAll();
  }

  @ApiOperation({ summary: '菜单修改' })
  @ApiOkResponse({ type: UpdateMenuResponse })
  @Patch('')
  @Reject()
  @Permission('menu::update')
  update(@Body() updateMenuDto: UpdateMenuDto) {
    return this.menuService.update(updateMenuDto);
  }

  @ApiOperation({ summary: '删除菜单' })
  @ApiQuery({ name: 'id', description: '菜单id' })
  @ApiQuery({
    name: 'parentId',
    description: '菜单父级ID',
    deprecated: true,
    required: false,
  })
  @ApiOkResponse({ type: MenuInfo })
  @Reject()
  @Delete()
  @Permission('menu::remove')
  remove(@Query('id') id: MenuId) {
    return this.menuService.remove(id);
  }
}
