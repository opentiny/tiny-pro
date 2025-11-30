import { Menu, Permission } from "@app/models";
import { ApiProperty } from "@nestjs/swagger";
import { PaginationLinks, PaginationMeta } from "../../public/api-paginated-response";
import { MenuTreeNode } from "../../public/menu-tree";

export class RoleInfoItem {
  @ApiProperty()
  id: string;
  @ApiProperty({
    description: '角色名'
  })
  name: string;
  @ApiProperty({
    description: '权限',
    type: [Permission]
  })
  permission: Permission[];
  @ApiProperty({
    description: '菜单',
    type: [Menu]
  })
  menus: Menu[]
}

export class RoleInfo {
  @ApiProperty({
    type: RoleInfoItem
  })
  items: RoleInfoItem;
  @ApiProperty({
    type: PaginationMeta
  })
  meta: PaginationMeta;
  @ApiProperty({
    type: PaginationLinks
  })
  links: PaginationLinks;
}

export class GetAllRoleDetail {
  @ApiProperty({
    type: RoleInfo
  })
  roleInfo: RoleInfo;
  @ApiProperty({
    type: [MenuTreeNode],
    description: '菜单树'
  })
  menuTree: MenuTreeNode[]
}
