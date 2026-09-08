import { Menu, MenuId } from '../../menu';
import { Role, RoleId } from '../role.entity';
import { Permission, PermissionId } from '../../permission';
import { FindAllRoleItem } from '../dto/find-all-role.dto';

export const findAllRole = (
  roles: Role[],
  permissionIdMap: Map<RoleId, PermissionId[]>,
  menuIdMap: Map<RoleId, MenuId[]>,
  permMap: Map<PermissionId, Permission>,
  menuMap: Map<MenuId, Menu>,
) => {
  const findAllRoleItem: FindAllRoleItem[] = [];
  for (const role of roles) {
    const rolePermission = (permissionIdMap.get(role.id) ?? [])
      .map((permId) => permMap.get(permId))
      .filter((val) => val !== undefined);
    const menus = (menuIdMap.get(role.id) ?? [])
      .map((menuId) => menuMap.get(menuId))
      .filter((val) => val !== undefined);
    findAllRoleItem.push({
      id: role.id,
      name: role.name,
      permission: rolePermission,
      menus,
    });
  }
  return findAllRoleItem;
};
