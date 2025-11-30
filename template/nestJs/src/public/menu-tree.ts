import { ApiProperty } from "@nestjs/swagger";
import { ITreeNodeData } from "../menu/menu.service";

export class MenuTreeNode implements ITreeNodeData {
  @ApiProperty({description: '唯一ID'})
  id: string | number;
  @ApiProperty({description: '标签'})
  label: string;
  @ApiProperty({description: '子菜单', type: [MenuTreeNode]})
  children?: ITreeNodeData[];
  @ApiProperty({description: '菜单路由'})
  url: string;
  @ApiProperty({description: '菜单组件'})
  component: string;
  @ApiProperty({description: 'icon'})
  customIcon: string;
  @ApiProperty({description: '菜单类型'})
  menuType: string;
  @ApiProperty({description: '父级ID'})
  parentId: number;
  @ApiProperty({description: '排序'})
  order: number;
  @ApiProperty({description: '国际化字段'})
  locale: string;
}
