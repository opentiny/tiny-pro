import { PaginationMeta, PaginationQueryDto } from '@app/shared';
import { IsOptional, IsString } from 'class-validator';
import { RoleId } from 'src/role';
import { UserInfo } from './get-user-info.dto';

export class GetAllUserRequest extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  name?: string;
  @IsOptional()
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
