import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class FindApplicationsRequest {
  @ApiPropertyOptional({
    description: '页数, 必须是一个大于零的正整数',
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({
    description: '页大小, 必须是一个正整数',
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 1;

  @ApiPropertyOptional({ description: '类型' })
  @IsOptional()
  classify: string;

  @ApiPropertyOptional({ description: '关键字' })
  @IsOptional()
  keywords: string;
}

class FindApplicationItem {
  @ApiProperty({
    description: '应用Tag',
  })
  tag: unknown;
  @ApiProperty({
    description: '应用 ID',
  })
  id: number;
  @ApiProperty({
    description: '应用名',
  })
  name: string;
  @ApiProperty({
    description: '应用图标',
  })
  icon: string;
  @ApiProperty({
    description: '应用类别',
  })
  classify: string;
}

export class FindApplicationEntity {
  @ApiProperty({
    type: [FindApplicationItem],
  })
  data: FindApplicationItem[];
  @ApiProperty({
    description: '应用总数',
  })
  total: number;
}
