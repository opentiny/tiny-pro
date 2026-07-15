import { PaginationMeta } from '@app/shared';
import { RoleInfo as RoleInfoItem } from './role-info';
import { ApiProperty } from '@nestjs/swagger';
import { ITreeNodeData } from '../../menu/types';
import type { MenuId } from '../../menu';

export class RoleMenuTreeNode implements ITreeNodeData {
  @ApiProperty({ description: '唯一ID' })
  id: MenuId;
  @ApiProperty({ description: '标签' })
  label: string;
  @ApiProperty({ description: '子菜单', type: [RoleMenuTreeNode] })
  children?: ITreeNodeData[];
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

  constructor(
    id: MenuId,
    label: string,
    url: string,
    component: string,
    customIcon: string,
    menuType: string,
    parentId: MenuId,
    order: number,
    locale: string,
    children?: ITreeNodeData[],
  ) {
    this.id = id;
    this.label = label;
    this.children = children;
    this.url = url;
    this.component = component;
    this.customIcon = customIcon;
    this.menuType = menuType;
    this.parentId = parentId;
    this.order = order;
    this.locale = locale;
  }
}

export class GetRoleInfo {
  @ApiProperty({
    type: [RoleInfoItem],
  })
  item: RoleInfoItem[];
  @ApiProperty({
    type: PaginationMeta,
  })
  meta: PaginationMeta;
  constructor(item: RoleInfoItem[], meta: PaginationMeta) {
    this.item = item;
    this.meta = meta;
  }
}

export class GetRoleDetail {
  @ApiProperty({
    type: [RoleMenuTreeNode],
  })
  menuTree: RoleMenuTreeNode[][];
  @ApiProperty({
    type: GetRoleInfo,
  })
  roleInfo: GetRoleInfo;
  constructor(menuTree: RoleMenuTreeNode[][], roleInfo: GetRoleInfo) {
    this.menuTree = menuTree;
    this.roleInfo = roleInfo;
  }
}
