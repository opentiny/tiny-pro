import { ApiProperty } from '@nestjs/swagger';

export class PaginationMeta {
  @ApiProperty({
    description: '本页大小',
  })
  itemCount: number;
  @ApiProperty({
    description: '元素大小',
  })
  totalItems: number;
  @ApiProperty({
    description: '每页大小',
  })
  itemsPerPage: number;
  @ApiProperty({
    description: '当前页数',
  })
  currentPage: number;
  constructor(
    itemCount: number,
    totalItems: number,
    itemsPerPage: number,
    currentPage: number,
  ) {
    this.itemCount = itemCount;
    this.totalItems = totalItems;
    this.itemsPerPage = itemsPerPage;
    this.currentPage = currentPage;
  }
}
