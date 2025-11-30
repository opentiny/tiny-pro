import { ApiProperty } from "@nestjs/swagger";

export class BatchRemoveUserDto {
  @ApiProperty({
    type: [String],
    description: '要删除的email集合'
  })
  emails: string[];
}
