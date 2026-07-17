import { IsNumber, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class PaginationQueryDto {
  @ApiProperty({
    description: '页数',
    default: 'process.env.PAGITION_PAGE',
    type: Number,
  })
  @IsOptional()
  @IsNumber()
  @Transform(({value}) => (isNaN(Number(value)) ? 1 : Number(value)))
  page?: number = Number(process.env.PAGITION_PAGE);

  @ApiProperty({
    description: '每页的大小',
    default: 'process.env.PAGITION_PAGE',
    type: Number,
  })
  @IsOptional()
  @IsNumber()
  @Transform(({value}) => (isNaN(Number(value)) ? 10 : Number(value)))
  limit?: number = Number(process.env.PAGITION_PAGE);
}

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
