import { ApiProperty } from '@nestjs/swagger';
import type { MenuId } from '../menu.entity';

export class MenuInfo {
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
  parentId: MenuId | null;

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
}
