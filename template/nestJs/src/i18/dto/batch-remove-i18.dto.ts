import { ApiProperty } from "@nestjs/swagger";

export class BatchRemoveI18Records {
  @ApiProperty({
    description: '想要删除的国际化字段ID数组',
    type: [Number]
  })
  ids: number[];
}
