import { ApiProperty } from "@nestjs/swagger";

class FindApplicationItem {
  @ApiProperty({
    description: '应用Tag'
  })
  tag: unknown;
  @ApiProperty({
    description: '应用 ID'
  })
  id: number;
  @ApiProperty({
    description: '应用名'
  })
  name: string;
  @ApiProperty({
    description: '应用图标'
  })
  icon: string;
  @ApiProperty({
    description: '应用类别'
  })
  classify: string;
}
export class FindApplicationEntity {
  @ApiProperty({
    type: [FindApplicationItem]
  })
  data: FindApplicationItem[];
  @ApiProperty({
    description: '应用总数'
  })
  total: number;
}
