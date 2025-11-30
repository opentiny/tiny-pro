import { applyDecorators, Type } from "@nestjs/common";
import { ApiExtraModels, ApiOkResponse, ApiProperty, getSchemaPath } from "@nestjs/swagger";

export class PaginationMeta {
  @ApiProperty({
    description: '本页大小'
  })
  itemCount: number;
  @ApiProperty({
    description: '元素大小'
  })
  totalItems: number;
  @ApiProperty({
    description: '每页大小'
  })
  itemsPerPage: number;
  @ApiProperty({
    description: '当前页数'
  })
  currentPage: number;
}

export class PaginationLinks{
  @ApiProperty({
    description: '第一页URL',
  })
  first: string;
  @ApiProperty({
    description: '前一页URL',
  })
  previous: string;
  @ApiProperty({
    description: '下一页URL',
  })
  next: string;
  @ApiProperty({
    description: '最后一页URL',
  })
  last: string;
}

export class Pagination<T> {
  items: T[];
  @ApiProperty({
    type: PaginationMeta
  })
  meta: PaginationMeta;
  @ApiProperty({
    type: PaginationLinks
  })
  links: PaginationLinks;
}


export const ApiPaginatedResponse  = <T extends Type<any>>(
  model: T,
) => {
  return applyDecorators(
    ApiExtraModels(Pagination,model),
    ApiOkResponse({
      schema:{
        allOf: [
          {$ref: getSchemaPath(Pagination)},
          {
            properties: {
              items: {
                type: 'array',
                items: {
                  $ref: getSchemaPath(model)
                }
              }
            }
          }
        ]
      }
    })
  )
}
