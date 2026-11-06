import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsDateString, IsNumber, IsOptional, IsString, ValidateIf } from 'class-validator';

export class UserCenterDataDto {
  @ApiPropertyOptional({ description: '排序：2、4 为倒序' })
  @IsOptional()
  @IsNumber()
  sort?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @ValidateIf((_, value) => value !== '')
  @IsDateString()
  startTime?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @ValidateIf((_, value) => value !== '')
  @IsDateString()
  endTime?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  filterStatus?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  filterType?: string[];
}
