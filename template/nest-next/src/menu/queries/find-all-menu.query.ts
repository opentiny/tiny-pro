import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { Menu, MenuId } from '../menu.entity';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/core';

export interface ITreeNodeData {
  // node-key='id' 设置节点的唯一标识
  id: MenuId;
  // 节点显示文本
  label: string;
  // 子节点
  children?: ITreeNodeData[];
  // 链接
  url: string;
  //组件
  component: string;
  //图标
  customIcon: string;
  //类型
  menuType: string;
  //父节点
  parentId?: MenuId | null;
  //排序
  order: number;
  //国际化
  locale: string;
}

export const toNode = (menu: Menu): ITreeNodeData => {
  return {
    label: menu.name,
    id: menu.id,
    children: [],
    url: menu.path,
    component: menu.component,
    customIcon: menu.icon ?? '',
    menuType: menu.menuType,
    parentId: menu.parentId,
    order: menu.order,
    locale: menu.locale,
  };
};

export const convertToTree = (
  menus: Menu[],
  parentId: MenuId | null = null,
): ITreeNodeData[] => {
  const map = new Map<MenuId | null, Menu[]>();
  for (const menu of menus) {
    const key = menu.parentId ?? null;
    if (!map.has(key)) {
      map.set(key, []);
    }
    map.get(key)!.push(menu);
  }

  const build = (pid: MenuId | null): ITreeNodeData[] => {
    const childrenMenus = map.get(pid) || [];
    return childrenMenus.map((menu) => {
      const node = toNode(menu);
      node.children = build(menu.id);
      return node;
    });
  };

  return build(parentId);
};

export class FindAllMenu extends Query<ITreeNodeData[]> {
  constructor() {
    super();
  }
}

@QueryHandler(FindAllMenu)
export class FindAllMenuQueryHandler implements IQueryHandler<FindAllMenu> {
  constructor(
    @InjectRepository(Menu)
    private readonly menuRepo: EntityRepository<Menu>,
  ) {}
  async execute(): Promise<ITreeNodeData[]> {
    const menus = await this.menuRepo.findAll();
    return convertToTree(menus);
  }
}
