import { convertToTree, Menu } from '../../menu';
import { Permission } from '../../permission';
import { FindRoleResponse } from '../dto/find-role.dto';
import { Role } from '../role.entity';

export const assembleFindRole = (
  role: Role,
  permission: readonly Permission[],
  menus: readonly Menu[],
) => {
  const menuTree = convertToTree([...menus]);
  return new FindRoleResponse({
    id: role.id,
    name: role.name,
    permission: [...permission],
    menus: menuTree,
  });
};
