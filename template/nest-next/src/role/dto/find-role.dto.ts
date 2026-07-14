import { ApiProperty } from '@nestjs/swagger';
import { type RoleId } from '../role.entity';
import type { PermissionId } from '../../permission';
import type { MenuId } from '../../menu';

export class FindRolePermission {
  @ApiProperty({ description: '权限ID' })
  id: PermissionId;
  @ApiProperty({ description: '权限描述' })
  desc: string;
  @ApiProperty({ description: '权限名称' })
  name: string;
  constructor(props: FindRolePermission) {
    Object.assign(this, props);
  }
}

export class FindRoleMenu {
  @ApiProperty({ description: '唯一ID' })
  id: MenuId;
  @ApiProperty({ description: '标签' })
  label: string;
  @ApiProperty({ description: '子菜单', type: [FindRoleMenu] })
  children?: FindRoleMenu[];
  @ApiProperty({ description: '菜单路由' })
  url: string;
  @ApiProperty({ description: '菜单组件' })
  component: string;
  @ApiProperty({ description: 'icon' })
  customIcon: string;
  @ApiProperty({ description: '菜单类型' })
  menuType: string;
  @ApiProperty({ description: '父级ID' })
  parentId?: MenuId | null;
  @ApiProperty({ description: '排序' })
  order: number;
  @ApiProperty({ description: '国际化字段' })
  locale: string;

  constructor(props: FindRoleMenu) {
    Object.assign(this, props);
  }
}

export class FindRoleResponse {
  @ApiProperty({ description: '角色ID' })
  id: RoleId;
  @ApiProperty({ description: '角色名称' })
  name: string;
  @ApiProperty({ description: '角色所拥有的权限', type: [FindRolePermission] })
  permissions: FindRolePermission[];
  @ApiProperty({ description: '角色所拥有的菜单', type: [FindRoleMenu] })
  menus: FindRoleMenu[];
  constructor(props: FindRoleResponse) {
    Object.assign(this, props);
  }
}
