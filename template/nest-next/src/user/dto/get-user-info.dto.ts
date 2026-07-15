import { ApiProperty } from '@nestjs/swagger';
import type { UserId } from '../user.entity';
import type { RoleId } from '../../role';
import type { PermissionId } from '../../permission';
import type { MenuId } from '../../menu';
import { formatDateToDay } from '../utils';

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
  parentId: MenuId | null | undefined;

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
    id: MenuId,
    name: string,
    order: number,
    parentId: MenuId | null | undefined,
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

export class UserInfo {
  @ApiProperty()
  id: UserId;
  @ApiProperty()
  name: string;
  @ApiProperty()
  email: string;
  @ApiProperty({ nullable: true })
  department: string | null;
  @ApiProperty({ nullable: true })
  employeeType: string | null;
  @ApiProperty({ nullable: true })
  protocolStart: string | null;
  @ApiProperty({ nullable: true })
  protocolEnd: string | null;
  @ApiProperty({ nullable: true })
  probationEnd: string | null;
  @ApiProperty({ nullable: true })
  probationStart: string | null;
  @ApiProperty({ nullable: true })
  probationDuration: string | null;
  @ApiProperty({ nullable: true })
  address: string | null;
  @ApiProperty({ nullable: true })
  status: number | null;
  @ApiProperty({
    description: '用户角色',
    type: [RoleInfo],
  })
  role: RoleInfo[];

  constructor(props: UserInfo) {
    this.id = props.id;
    this.name = props.name;
    this.email = props.email;
    this.department = props.department;
    this.employeeType = props.employeeType;
    this.protocolStart = props.protocolStart
      ? formatDateToDay(new Date(props.protocolStart))
      : props.protocolStart;
    this.protocolEnd = props.protocolEnd
      ? formatDateToDay(new Date(props.protocolEnd))
      : props.protocolEnd;
    this.probationEnd = props.probationEnd
      ? formatDateToDay(new Date(props.probationEnd))
      : props.probationEnd;
    this.probationStart = props.probationStart
      ? formatDateToDay(new Date(props.probationStart))
      : props.probationStart;
    this.probationDuration = props.probationDuration;
    this.address = props.address;
    this.status = props.status;
  }
}
