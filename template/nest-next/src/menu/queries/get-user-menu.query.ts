import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository, FilterQuery } from '@mikro-orm/core';
import { convertToTree, Menu } from '../../menu';
import { User, UserId, UserNotFound } from '../../user';
import { TreeNode } from '../types';
import { RoleMenu } from '../../role';

export type GetUserInfoRequest =
  | {
      email: string;
      id?: never;
    }
  | {
      email?: never;
      id: UserId;
    };

export class GetUserMenu extends Query<TreeNode[]> {
  constructor(public readonly request: GetUserInfoRequest) {
    super();
  }
}

@QueryHandler(GetUserMenu)
export class GetUserMenuService implements IQueryHandler<GetUserMenu> {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>,
    @InjectRepository(RoleMenu)
    private readonly roleMenuRepo: EntityRepository<RoleMenu>,
    @InjectRepository(Menu)
    private readonly menuRepo: EntityRepository<Menu>,
  ) {}
  async execute(query: GetUserMenu): Promise<TreeNode[]> {
    const whereCondition: FilterQuery<User> = {};
    if (query.request.email) {
      whereCondition['email'] = query.request.email;
    }
    if (query.request.id) {
      whereCondition['id'] = query.request.id;
    }
    const user = await this.userRepository.findOne(
      {
        ...whereCondition,
      },
      { populate: ['role'] },
    );
    if (!user) {
      throw new UserNotFound();
    }
    const roles = user.role;
    const roleIds = roles.map((role) => role.roleId);
    const roleMenus = await this.roleMenuRepo.find({
      roleId: { $in: roleIds },
    });
    const menuIds = roleMenus.map((menu) => menu.menuId);
    const menus = await this.menuRepo.find({
      id: { $in: menuIds },
    });
    return convertToTree(menus);
  }
}
