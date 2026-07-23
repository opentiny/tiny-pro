import { PaginationMeta, PaginationQueryDto } from '@app/shared';
import { IsArray, IsOptional, IsString } from 'class-validator';
import { RoleId } from 'src/role';
import { UserInfo } from './get-user-info.dto';
import { Transform } from 'class-transformer';

export class GetAllUserRequest extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  name?: string;
  @IsOptional()
  @Transform(({ value }) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return typeof value === 'string' ? value.split(',') : value;
  })
  @IsString({ each: true })
  role?: RoleId[];
  @IsOptional()
  @IsString()
  email?: string;
}

export class UserList {
  items: UserInfo[];
  meta: PaginationMeta;
  constructor(item: UserInfo[], meta: PaginationMeta) {
    this.items = item;
    this.meta = meta;
  }
}
