import { ApiProperty } from '@nestjs/swagger';
import type { RoleId } from '../role.entity';
import type { PermissionId } from '../../permission';
import type { MenuId } from '../../menu';

export class FindAllRoleItemMenu {
  @ApiProperty({
    description: '菜单ID',
  })
  id: MenuId;

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
  parentId?: MenuId | null;

  @ApiProperty({
    description: '菜单类型',
  })
  menuType: string;
  @ApiProperty({
    description: '菜单图标',
  })
  icon?: string | null;

  @ApiProperty({
    description: '菜单对应的前端组件',
  })
  component: string;

  @ApiProperty({ description: '菜单路由地址' })
  path: string;

  @ApiProperty({
    description: '菜单国际化key',
  })
  locale: string;

  constructor(props: FindAllRoleItemMenu) {
    Object.assign(this, props);
  }
}

export class FindAllRoleItemPermission {
  @ApiProperty({
    description: '权限ID',
  })
  id: PermissionId;
  @ApiProperty({
    description: '权限描述',
  })
  desc: string;
  @ApiProperty({
    description: '权限名称',
  })
  name: string;
  constructor(props: FindAllRoleItemPermission) {
    Object.assign(this, props);
  }
}

export class FindAllRoleItem {
  @ApiProperty({
    description: '角色ID',
  })
  id: RoleId;
  @ApiProperty({
    description: '角色名称',
  })
  name: string;
  @ApiProperty({
    description: '角色所拥有的权限',
    type: [FindAllRoleItemPermission],
  })
  permission: FindAllRoleItemPermission[];
  @ApiProperty({
    description: '角色所拥有的菜单',
    type: [FindAllRoleItemMenu],
  })
  menus: FindAllRoleItemMenu[];
  constructor(props: FindAllRoleItem) {
    Object.assign(this, props);
  }
}
