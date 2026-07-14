import { ApiProperty } from '@nestjs/swagger';

export class MenuInfo {
  @ApiProperty({
    description: '菜单ID',
  })
  id: number;

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
  parentId: number | null;

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
