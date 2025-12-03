import { Permission } from "@app/models";
import { ApiProperty } from "@nestjs/swagger";
import { PaginationLinks, PaginationMeta } from "../../public/api-paginated-response";

export class GetAllPermission {
  @ApiProperty({
    type: [Permission]
  })
  item: Permission[];
  @ApiProperty({
    type: PaginationMeta
  })
  meta: PaginationMeta;
  @ApiProperty({
    type: PaginationLinks
  })
  links: PaginationLinks;
}
