import { ApiProperty } from '@nestjs/swagger';
import type { MenuId } from '../menu.entity';

export interface ITreeNodeData {
  // node-key='id' 设置节点的唯一标识
  id: MenuId;
  // 节点显示文本
  label: string;
  // 子节点
  children?: ITreeNodeData[];
  // 链接
  url: string;
  //组件
  component: string;
  //图标
  customIcon: string;
  //类型
  menuType: string;
  //父节点
  parentId?: MenuId | null;
  //排序
  order: number;
  //国际化
  locale: string;
}

export class TreeNode implements ITreeNodeData {
  @ApiProperty({
    description: "node-key='id' 设置节点的唯一标识",
  })
  id: MenuId;
  @ApiProperty({
    description: '节点显示文本',
  })
  label: string;
  @ApiProperty({
    description: '子节点',
    required: false,
    type: () => [TreeNode],
  })
  children?: ITreeNodeData[];
  @ApiProperty({
    description: '链接',
  })
  url: string;
  @ApiProperty({
    description: '组件',
  })
  component: string;
  @ApiProperty({
    description: '图标',
  })
  customIcon: string;
  @ApiProperty({
    description: '类型',
  })
  menuType: string;
  @ApiProperty({
    description: '节点',
  })
  parentId?: MenuId | null;
  @ApiProperty({
    description: '排序',
  })
  order: number;
  @ApiProperty({
    description: '国际化key',
  })
  locale: string;
  constructor(props: TreeNode) {
    Object.assign(this, props);
  }
}
