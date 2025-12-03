import { ApiProperty } from "@nestjs/swagger";
import { PaginationLinks, PaginationMeta } from "../../public/api-paginated-response";
import { Lang } from "@app/models";

export class FindAllI18nItem {
  @ApiProperty({
    description: '国际化字段的自增id'
  })
  id: number;
  @ApiProperty({
    description: '国际化字段对应的语言信息',
    type: () => Lang
  })
  lang: Lang;
  @ApiProperty({
    description: '国际化字段的键'
  })
  key: string;
  @ApiProperty({
    description: '国际化字段的实际内容'
  })
  content: string;
}

export class FindAllI18n {
  @ApiProperty({
    type: [FindAllI18nItem]
  })
  items: FindAllI18nItem[]
  @ApiProperty({
    type: PaginationMeta
  })
  meta: PaginationMeta;
  @ApiProperty({
    type: PaginationLinks
  })
  links: PaginationLinks;
}
