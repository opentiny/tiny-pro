import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class EmployeeSearchFilter {
  @IsOptional()
  @IsString()
  field?: string;

  @IsOptional()
  @IsArray()
  values?: Array<string | number>;

  @IsOptional()
  @IsString()
  start?: string;

  @IsOptional()
  @IsString()
  end?: string;
}

export class EmployeeSearchInfo {
  @IsOptional()
  @IsString()
  keyword?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EmployeeSearchFilter)
  filters?: EmployeeSearchFilter[];
}

export class EmployeeQueryBody {
  @IsOptional()
  @IsInt()
  pageIndex?: number;

  @IsOptional()
  @IsInt()
  pageSize?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => EmployeeSearchInfo)
  searchInfo?: EmployeeSearchInfo;
}
