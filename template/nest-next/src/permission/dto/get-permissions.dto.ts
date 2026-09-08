import { PaginationMeta } from '@app/shared';
import { ApiProperty } from '@nestjs/swagger';
import type { PermissionId } from '../permission.entry';

export class GetPermissionInfo {
  @ApiProperty()
  id: PermissionId;
  @ApiProperty()
  desc: string;
  @ApiProperty()
  name: string;
  constructor(id: PermissionId, desc: string, name: string) {
    this.id = id;
    this.desc = desc;
    this.name = name;
  }
}

export class GetPermissionResponse {
  @ApiProperty()
  items: GetPermissionInfo[];
  @ApiProperty({ type: PaginationMeta })
  meta: PaginationMeta;
  constructor(items: GetPermissionInfo[], meta: PaginationMeta) {
    this.items = items;
    this.meta = meta;
  }
}
