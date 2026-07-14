import { ApiProperty } from '@nestjs/swagger';
import { type RoleId } from '../role.entity';
import type { PermissionId } from '../../permission';

export class RolePermission {
  @ApiProperty({
    description: '权限ID',
  })
  id: PermissionId;

  @ApiProperty({
    description: '权限简介',
  })
  desc: string;
  @ApiProperty({
    description: '权限名, 前端或外部服务使用',
  })
  name: string;

  constructor(id: PermissionId, desc: string, name: string) {
    this.id = id;
    this.desc = desc;
    this.name = name;
  }
}

export class RoleMenu {
  @ApiProperty({
    description: '菜单ID',
  })
  id: string | number;

  @ApiProperty({
    description: '菜单名',
  })
  name: string;

  @ApiProperty({
    description: '菜单序列',
  })
  order: number;
  @ApiProperty({
    description: '菜单父级',
    nullable: true,
  })
  parentId: string | number | null | undefined;

  @ApiProperty({
    description: '菜单类型',
  })
  menuType: string;
  @ApiProperty({
    description: '菜单图标',
    nullable: true,
  })
  icon: string | null;

  @ApiProperty({
    description: '菜单对应的前端组件',
  })
  component: string;

  @ApiProperty({
    description: '菜单路由地址',
  })
  path: string;

  @ApiProperty({
    description: '菜单国际化key',
  })
  locale: string;

  constructor(
    id: string | number,
    name: string,
    order: number,
    parentId: string | number | null | undefined,
    menuType: string,
    icon: string | null,
    component: string,
    path: string,
    locale: string,
  ) {
    this.id = id;
    this.name = name;
    this.order = order;
    this.parentId = parentId;
    this.menuType = menuType;
    this.icon = icon ?? '';
    this.component = component;
    this.path = path;
    this.locale = locale;
  }
}

export class RoleInfo {
  @ApiProperty({
    description: '角色ID',
  })
  id: RoleId;
  @ApiProperty({
    description: '角色名称 (人类可读)',
  })
  name: string;
  @ApiProperty({
    description: '角色所拥有的权限',
    type: [RolePermission],
  })
  permission: RolePermission[];
  @ApiProperty({
    description: '角色所拥有的菜单',
    type: [RoleMenu],
  })
  menus: RoleMenu[];
  constructor(
    id: RoleId,
    name: string,
    permission: RolePermission[],
    menus: RoleMenu[],
  ) {
    this.id = id;
    this.name = name;
    this.permission = permission;
    this.menus = menus;
  }
}
