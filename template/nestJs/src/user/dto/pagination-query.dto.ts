import { IsOptional } from 'class-validator';
import { Transform} from 'class-transformer';
import * as process from "process";
import { ApiProperty } from '@nestjs/swagger';
export class PaginationQueryDto {
  @ApiProperty({
    description: '页数',
    default: 'process.env.PAGITION_PAGE',
    type: Number
  })
  @IsOptional()
  @Transform(value => isNaN(Number(value)) ? 1 : Number(value))
  page?: number = Number(process.env.PAGITION_PAGE);

  @ApiProperty({
    description: '每页的大小',
    default: 'process.env.PAGITION_PAGE',
    type: Number
  })
  @IsOptional()
  @Transform(value => isNaN(Number(value)) ? 10 : Number(value))
  limit?: number = Number(process.env.PAGITION_PAGE);
}
