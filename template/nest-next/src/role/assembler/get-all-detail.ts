import { Permission, PermissionId } from '../../permission';
import { Role, RoleId } from '../role.entity';
import { convertToTree, ITreeNodeData, Menu, MenuId } from '../../menu';
import { RoleInfo as RoleInfoItem } from '../dto/role-info';
import { GetRoleDetail, GetRoleInfo } from '../dto/get-role-detail.dto';
import { PaginationMeta } from '@app/shared';

export const assembleGetDetail = (
  roles: Role[],
  permissionIdMap: Map<RoleId, PermissionId[]>,
  menuIdMap: Map<RoleId, MenuId[]>,
  permMap: Map<PermissionId, Permission>,
  menuMap: Map<MenuId, Menu>,
  total: number,
  page?: number,
  size?: number,
) => {
  const infoItem: RoleInfoItem[] = [];
  const menuTrees: ITreeNodeData[][] = [];
  for (const role of roles) {
    const permission = (permissionIdMap.get(role.id) ?? [])
      .map((id) => permMap.get(id))
      .filter((value) => value !== undefined);
    const menus = (menuIdMap.get(role.id) ?? [])
      .flatMap((id) => menuMap.get(id))
      .filter((value) => value !== undefined);
    menuTrees.push(convertToTree(menus));
    const item = new RoleInfoItem(role.id, role.name, permission, menus);
    infoItem.push(item);
  }
  const meta = new PaginationMeta(roles.length, total, size ?? 1, page ?? 1);
  return new GetRoleDetail(menuTrees, new GetRoleInfo(infoItem, meta));
};
