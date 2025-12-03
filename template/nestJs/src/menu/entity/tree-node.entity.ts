import { ApiProperty } from "@nestjs/swagger";
import { ITreeNodeData } from "../menu.service";

export class TreeNode implements ITreeNodeData {
  @ApiProperty({
    description: 'node-key=\'id\' 设置节点的唯一标识'
  })
  id: string | number;
  @ApiProperty({
    description: '节点显示文本'
  })
  label: string;
  @ApiProperty({
    description: '子节点',
    required: false,
    type: () => [TreeNode]
  })
  children?: ITreeNodeData[];
  @ApiProperty({
    description: '链接'
  })
  url: string;
  @ApiProperty({
    description: '组件'
  })
  component: string;
  @ApiProperty({
    description: '图标'
  })
  customIcon: string;
  @ApiProperty({
    description: '类型'
  })
  menuType: string;
  @ApiProperty({
    description: '节点'
  })
  parentId: number;
  @ApiProperty({
    description: '排序'
  })
  order: number;
  @ApiProperty({
    description: '国际化key'
  })
  locale: string;
}
