import { PaginationMeta, PaginationQueryDto } from '@app/shared';
import { IsString } from 'class-validator';
import { RoleId } from 'src/role';
import { UserInfo } from './get-user-info.dto';

export class GetAllUserRequest extends PaginationQueryDto {
  @IsString()
  name?: string;
  @IsString({ each: true })
  role?: RoleId[];
  @IsString()
  email?: string;
}

export class UserList {
  item: UserInfo[];
  meta: PaginationMeta;
  constructor(item: UserInfo[], meta: PaginationMeta) {
    this.item = item;
    this.meta = meta;
  }
}
