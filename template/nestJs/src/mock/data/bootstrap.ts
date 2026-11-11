import { HttpException, HttpStatus } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * 登录与系统引导链路（登录、用户、角色、权限、菜单、国际化）的 mock 数据。
 *
 * 仅在无库 mock 联调模式（MOCK_MODE=true）下由 MockModeMiddleware 接管，
 * 保证不启动 MySQL/Redis 时前端也能完成登录并进入系统、进行系统管理页的
 * 增删改查调试。字段结构与真实接口保持一致，菜单/国际化种子数据复用仓库
 * 根目录的 menu-data.json / locales.json（与真实后端的种子来源相同）。
 * 所有数据保存在内存中，重启后还原。
 */

// 与 user.initalizer.ts 的种子账号保持一致
const ADMIN_EMAIL = 'admin@no-reply.com';
const ADMIN_PASSWORD = 'admin';

const ACCESS_TOKEN_TTL = 3600;
const REFRESH_TOKEN_TTL = 86400;

interface MockMenuNode {
  id: number;
  label: string;
  url: string;
  component: string;
  customIcon: string;
  menuType: string;
  parentId: number | null;
  order: number;
  locale: string;
  children: MockMenuNode[];
}

interface MockPermission {
  id: number;
  name: string;
  desc: string;
}

interface MockRole {
  id: number;
  name: string;
  permission: MockPermission[];
  menus: MockMenuNode[];
}

interface MockLocaleRecord {
  id: number;
  key: string;
  content: string;
  lang: { id: number; name: string };
}

function readSeedFile<T>(filename: string): T {
  return JSON.parse(readFileSync(join(process.cwd(), filename), 'utf-8'));
}

// menu-data.json 的节点没有 id/parentId/order，这里按遍历顺序补齐
let nextMenuId = 1;
function buildMenuTree(
  nodes: any[],
  parentId: number | null = null
): MockMenuNode[] {
  return nodes.map((node) => {
    const id = nextMenuId++;
    return {
      id,
      label: node.label,
      url: node.url,
      component: node.component,
      customIcon: node.icon ?? '',
      menuType: node.menuType ?? 'normal',
      parentId,
      order: id,
      locale: node.locale,
      children: buildMenuTree(node.children ?? [], id),
    };
  });
}

// ============================== 内存状态 ==============================

const languages = [
  { id: 1, name: 'enUS' },
  { id: 2, name: 'zhCN' },
];

const menuTree: MockMenuNode[] = buildMenuTree(
  readSeedFile<any[]>('menu-data.json')
);
const localeTable = readSeedFile<Record<string, Record<string, string>>>(
  'locales.json'
);

const permissions: MockPermission[] = [
  { id: 1, name: '*', desc: '全部权限' },
  { id: 2, name: 'user::query', desc: '查询用户' },
  { id: 3, name: 'permission::get', desc: '查询权限' },
  { id: 4, name: 'role::query', desc: '查询角色' },
  { id: 5, name: 'menu::query', desc: '查询菜单' },
  { id: 6, name: 'i18n::query', desc: '查询国际化词条' },
];

const roles: MockRole[] = [
  {
    id: 1,
    name: 'admin',
    permission: [permissions[0]],
    menus: menuTree,
  },
];

// admin 用户只持有 admin 角色（注意是独立数组，与上面的角色注册表分开，
// 否则角色注册表的增删会被误判为"用户引用了该角色"）
const adminUser = {
  id: '1',
  name: 'admin',
  email: ADMIN_EMAIL,
  department: 'Tiny-Vue-Pro',
  employeeType: 'social recruitment',
  probationStart: '2021-04-19',
  probationEnd: '2021-10-15',
  probationDuration: '180',
  protocolStart: '2021-04-19',
  protocolEnd: '2024-04-19',
  address: 'xian',
  status: 'normal',
  role: [roles[0]],
};

const users: any[] = [adminUser];
let nextUserId = 2;

// 个人中心页（user/info）表格与任务图的种子数据。
// type/status 存的是国际化 key，前端用 $t 渲染；筛选提交的是选项字母（A/B/C、A-D）
const userCenterTypes = [
  'userInfo.type.optionA',
  'userInfo.type.optionB',
  'userInfo.type.optionC',
];
const userCenterStatuses = [
  'userInfo.status.optionA',
  'userInfo.status.optionB',
  'userInfo.status.optionC',
  'userInfo.status.optionD',
];
const userCenterNames = [
  '完成 TinyPro 表单页开发',
  '修复登录页移动端样式',
  '编写接口联调文档',
  '联调员工列表接口',
  '优化看板加载性能',
  '整理迭代计划',
  '评审富文本需求',
  '补充单元测试用例',
];

const userCenterTableData = Array.from({ length: 8 }, (_, i) => ({
  name: userCenterNames[i],
  time: `2026-10-${String(8 + i * 3).padStart(2, '0')} 1${i}:30:00`,
  type: userCenterTypes[i % userCenterTypes.length],
  status: userCenterStatuses[i % userCenterStatuses.length],
}));

const userCenterChartData = [
  {
    title: 'userInfo.tab.two',
    value: 1,
    list: [
      { sort: 1, type: 'userInfo.type.optionA', status: 'userInfo.status.optionA', len: 1, pid: 'A' },
      { sort: 2, type: 'userInfo.type.optionB', status: 'userInfo.status.optionB', len: 2, pid: 'B' },
      { sort: 3, type: 'userInfo.type.optionC', status: 'userInfo.status.optionC', len: 1, pid: 'C' },
      { sort: 4, type: 'userInfo.type.optionA', status: 'userInfo.status.optionD', len: 2, pid: 'D' },
    ],
  },
  {
    title: 'userInfo.tab.one',
    value: 2,
    list: [
      { sort: 1, type: 'userInfo.type.optionB', status: 'userInfo.status.optionA', len: 1, pid: 'B' },
      { sort: 2, type: 'userInfo.type.optionC', status: 'userInfo.status.optionB', len: 2, pid: 'C' },
      { sort: 3, type: 'userInfo.type.optionA', status: 'userInfo.status.optionC', len: 1, pid: 'A' },
      { sort: 4, type: 'userInfo.type.optionB', status: 'userInfo.status.optionD', len: 2, pid: 'B' },
      { sort: 5, type: 'userInfo.type.optionC', status: 'userInfo.status.optionA', len: 1, pid: 'C' },
    ],
  },
];

function optionLetter(i18nKey: string) {
  return i18nKey.slice(-1);
}

const localeRecords: MockLocaleRecord[] = Object.entries(localeTable).flatMap(
  ([language, messages]) =>
    Object.entries(messages).map(([key, content], index) => ({
      id: language === 'enUS' ? index + 1 : index + 10001,
      key,
      content,
      lang: languages.find((item) => item.name === language) ?? languages[0],
    }))
);

// ============================== 工具函数 ==============================

function issueTokenPair(email: string) {
  return {
    accessToken: `mock-access-token:${email}`,
    accessTokenTTL: ACCESS_TOKEN_TTL,
    refreshToken: `mock-refresh-token:${email}`,
    refreshTokenTTL: REFRESH_TOKEN_TTL,
  };
}

// 与前端 IPaginationMeta 一致的分页结构
function paginate<T>(items: T[], query: any) {
  if (Number(query?.all ?? 0)) {
    return {
      items,
      meta: {
        currentPage: 1,
        itemCount: items.length,
        itemsPerPage: items.length,
        totalItems: items.length,
        totalPages: 1,
      },
    };
  }
  const page = Math.max(1, Number(query?.page ?? 1));
  const limit = Math.max(1, Number(query?.limit ?? 10));
  const start = (page - 1) * limit;
  return {
    items: items.slice(start, start + limit),
    meta: {
      currentPage: page,
      itemCount: Math.min(limit, Math.max(0, items.length - start)),
      itemsPerPage: limit,
      totalItems: items.length,
      totalPages: Math.ceil(items.length / limit),
    },
  };
}

function includesName(value: string, filter: unknown) {
  const keyword = String(filter ?? '')
    .replaceAll('%', '')
    .toLowerCase();
  return !keyword || value.toLowerCase().includes(keyword);
}

function nextRecordId(list: { id: number }[]) {
  return Math.max(0, ...list.map((item) => item.id)) + 1;
}

function flattenMenus(nodes: MockMenuNode[]): MockMenuNode[] {
  return nodes.flatMap((node) => [node, ...flattenMenus(node.children)]);
}

function selectMenus(nodes: MockMenuNode[], ids: Set<number>): MockMenuNode[] {
  return nodes.flatMap((node) => {
    const children = selectMenus(node.children, ids);
    if (!ids.has(node.id) && !children.length) {
      return [];
    }
    return [{ ...node, children }];
  });
}

function findMenuLocation(
  nodes: MockMenuNode[],
  id: number
): { node: MockMenuNode; siblings: MockMenuNode[] } | null {
  for (const node of nodes) {
    if (node.id === id) {
      return { node, siblings: nodes };
    }
    const child = findMenuLocation(node.children, id);
    if (child) {
      return child;
    }
  }
  return null;
}

// 菜单变更后保持角色菜单与菜单树同步（先快照各角色已选菜单 id，变更后重选）
function snapshotRoleMenuIds() {
  return new Map(
    roles.map((role) => [
      role.id,
      new Set(flattenMenus(role.menus).map((item) => item.id)),
    ])
  );
}

function syncRoleMenus(roleMenuIds: Map<number, Set<number>>) {
  roles.forEach((role) => {
    role.menus = selectMenus(
      menuTree,
      roleMenuIds.get(role.id) ?? new Set()
    );
  });
}

function writeFormattedLocale(record: MockLocaleRecord) {
  localeTable[record.lang.name] ??= {};
  localeTable[record.lang.name][record.key] = record.content;
}

function removeFormattedLocale(record: MockLocaleRecord) {
  delete localeTable[record.lang.name]?.[record.key];
}

// ============================== 接口定义 ==============================

export default [
  {
    url: '/api/auth/login',
    method: 'post',
    response: (params: { body: any }) => {
      const { email, password } = params.body ?? {};
      if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
        throw new HttpException('邮箱或密码错误', HttpStatus.UNAUTHORIZED);
      }
      return issueTokenPair(email);
    },
  },
  {
    url: '/api/auth/token/refresh',
    method: 'post',
    response: (params: { body: any }) => {
      const token: string = params.body?.token ?? '';
      const email = token.split(':')[1] || ADMIN_EMAIL;
      return issueTokenPair(email);
    },
  },
  {
    url: '/api/auth/logout',
    method: 'post',
    response: () => true,
  },
  {
    url: '/api/user/info/:email?',
    method: 'get',
    response: (params: { params: Record<string, string> }) => {
      const email = params.params?.email || ADMIN_EMAIL;
      return (
        users.find((item) => item.email === email) ??
        (() => {
          throw new HttpException('用户不存在', HttpStatus.NOT_FOUND);
        })()
      );
    },
  },
  {
    url: '/api/user/reg',
    method: 'post',
    response: (params: { body: any }) => {
      const { email, name, password, roleIds } = params.body ?? {};
      if (!email || !name || !password) {
        throw new HttpException('邮箱、姓名、密码为必填项', HttpStatus.BAD_REQUEST);
      }
      if (users.some((item) => item.email === email)) {
        throw new HttpException('用户已存在', HttpStatus.CONFLICT);
      }
      const user = {
        id: String(nextUserId++),
        name,
        email,
        password,
        department: '',
        employeeType: '',
        probationStart: '',
        probationEnd: '',
        probationDuration: '',
        protocolStart: '',
        protocolEnd: '',
        address: '',
        status: 'normal',
        role: roles.filter((item) => (roleIds ?? []).includes(item.id)),
      };
      users.push(user);
      return user;
    },
  },
  {
    url: '/api/user/update',
    method: 'patch',
    response: (params: { body: any }) => {
      const body = params.body ?? {};
      const user = users.find(
        (item) =>
          item.email === body.email ||
          item.email === body.originalEmail ||
          String(item.id) === String(body.id)
      );
      if (!user) {
        throw new HttpException('用户不存在', HttpStatus.NOT_FOUND);
      }
      const editable = [
        'name',
        'department',
        'employeeType',
        'probationStart',
        'probationEnd',
        'probationDuration',
        'protocolStart',
        'protocolEnd',
        'address',
        'status',
      ] as const;
      for (const field of editable) {
        if (body[field] !== undefined) {
          user[field] = body[field];
        }
      }
      if (body.roleIds) {
        user.role = roles.filter((item) => body.roleIds.includes(item.id));
      }
      return user;
    },
  },
  {
    url: '/api/user/batch',
    method: 'post',
    response: (params: { body: any }) => {
      const emails = Array.isArray(params.body)
        ? params.body
        : params.body?.emails ?? [];
      const removed: any[] = [];
      emails.forEach((email: string) => {
        const index = users.findIndex((item) => item.email === email);
        if (index > -1 && users[index] !== adminUser) {
          removed.push(users.splice(index, 1)[0]);
        }
      });
      return removed;
    },
  },
  {
    url: '/api/user/:email',
    method: 'delete',
    response: (params: { params: Record<string, string> }) => {
      const index = users.findIndex(
        (item) =>
          item.email === params.params?.email && item !== adminUser
      );
      if (index === -1) {
        throw new HttpException('用户不存在', HttpStatus.NOT_FOUND);
      }
      return users.splice(index, 1)[0];
    },
  },
  {
    url: '/api/user/admin/updatePwd',
    method: 'patch',
    response: (params: { body: any }) => {
      const user = users.find(
        (item) => item.email === params.body?.email
      );
      if (!user) {
        throw new HttpException('用户不存在', HttpStatus.NOT_FOUND);
      }
      user.password = params.body?.newPassword ?? params.body?.password;
      return true;
    },
  },
  {
    url: '/api/user/updatePwd',
    method: 'patch',
    response: (params: { body: any }) => {
      const user = users.find((item) => item.email === adminUser.email);
      const oldPassword = params.body?.oldPassword ?? params.body?.password;
      if (user?.password !== undefined && oldPassword !== user.password) {
        throw new HttpException('原密码错误', HttpStatus.BAD_REQUEST);
      }
      if (user) {
        user.password = params.body?.newPassword;
      }
      return true;
    },
  },
  {
    url: '/api/mail/login',
    method: 'post',
    response: (params: { body: any }) => ({
      token: `mock-mail-token:${params.body?.mailname ?? ADMIN_EMAIL}`,
    }),
  },
  {
    url: '/api/user/data',
    method: 'post',
    response: (params: { body: any }) => {
      // 个人中心页数据：表格列表 + 任务图，支持排序与筛选（类型/状态/起止时间）
      const body = params.body ?? {};
      let rows = userCenterTableData.map(item => ({ ...item }));
      if (Array.isArray(body.filterType) && body.filterType.length) {
        rows = rows.filter(item =>
          body.filterType.includes(optionLetter(item.type))
        );
      }
      if (Array.isArray(body.filterStatus) && body.filterStatus.length) {
        rows = rows.filter(item =>
          body.filterStatus.includes(optionLetter(item.status))
        );
      }
      if (body.startTime) {
        rows = rows.filter(
          (item) => item.time.slice(0, 10) >= String(body.startTime)
        );
      }
      if (body.endTime) {
        rows = rows.filter(
          (item) => item.time.slice(0, 10) <= String(body.endTime)
        );
      }
      // 排序：1 结束正序 2 结束倒序 3 开始正序 4 开始倒序
      const descending = body.sort === 2 || body.sort === 4;
      rows.sort((a, b) =>
        descending ? b.time.localeCompare(a.time) : a.time.localeCompare(b.time)
      );
      // 顶部状态统计卡（InfoTasksTip），随筛选联动
      const taskSummary = ['A', 'B', 'C', 'D'].map((status) => ({
        status,
        value: rows.filter((item) => optionLetter(item.status) === status).length,
      }));
      return { chartData: userCenterChartData, tableData: rows, taskSummary };
    },
  },
  {
    url: '/api/user',
    method: 'get',
    response: (params: { query: any }) => {
      const filtered = users.filter(
        (item) =>
          includesName(item.name, params.query?.name) &&
          includesName(item.email, params.query?.email)
      );
      return paginate(filtered, params.query);
    },
  },
  {
    url: '/api/permission',
    method: 'get',
    response: (params: { query: any }) => {
      const filtered = permissions.filter(
        (item) =>
          includesName(item.name, params.query?.name) ||
          includesName(item.desc, params.query?.name)
      );
      // 角色编辑弹窗不带分页参数，期望拿到完整数组
      return params.query?.page !== undefined ||
        params.query?.limit !== undefined
        ? paginate(filtered, params.query)
        : filtered;
    },
  },
  {
    url: '/api/permission',
    method: 'post',
    response: (params: { body: any }) => {
      const permission = {
        id: nextRecordId(permissions),
        name: params.body?.name,
        desc: params.body?.desc ?? '',
      };
      permissions.push(permission);
      return permission;
    },
  },
  {
    url: '/api/permission',
    method: 'patch',
    response: (params: { body: any }) => {
      const permission = permissions.find(
        (item) => item.id === Number(params.body?.id)
      );
      if (!permission) {
        throw new HttpException('权限不存在', HttpStatus.NOT_FOUND);
      }
      Object.assign(permission, params.body);
      return permission;
    },
  },
  {
    url: '/api/permission/:id',
    method: 'delete',
    response: (params: { params: Record<string, string> }) => {
      const index = permissions.findIndex(
        (item) => item.id === Number(params.params?.id)
      );
      if (index < 0) {
        throw new HttpException('权限不存在', HttpStatus.NOT_FOUND);
      }
      if (
        roles.some((role) =>
          role.permission.some(
            (item) => item.id === Number(params.params?.id)
          )
        )
      ) {
        throw new HttpException(
          '权限仍被角色引用',
          HttpStatus.CONFLICT
        );
      }
      return permissions.splice(index, 1)[0];
    },
  },
  {
    url: '/api/role',
    method: 'get',
    response: () => roles,
  },
  {
    url: '/api/role/info/:id',
    method: 'get',
    response: (params: { params: Record<string, string> }) => {
      const role = roles.find(
        (item) => item.id === Number(params.params?.id)
      );
      if (!role) {
        throw new HttpException('角色不存在', HttpStatus.NOT_FOUND);
      }
      return role;
    },
  },
  {
    url: '/api/menu/role/:email',
    method: 'get',
    response: (params: { params: Record<string, string> }) => {
      const user = users.find(
        (item) => item.email === params.params?.email
      );
      if (!user) {
        throw new HttpException('用户不存在', HttpStatus.NOT_FOUND);
      }
      const seen = new Set<number>();
      return user.role
        .flatMap((role: MockRole) => role.menus)
        .filter((menu: MockMenuNode) => {
          if (seen.has(menu.id)) {
            return false;
          }
          seen.add(menu.id);
          return true;
        });
    },
  },
  {
    url: '/api/role/detail',
    method: 'get',
    response: (params: { query: any }) => {
      const filtered = roles.filter((item) =>
        includesName(item.name, params.query?.name)
      );
      return {
        roleInfo: paginate(filtered, params.query),
        menuTree: filtered.map((role) => role.menus),
      };
    },
  },
  {
    url: '/api/role',
    method: 'post',
    response: (params: { body: any }) => {
      const role: MockRole = {
        id: nextRecordId(roles),
        name: params.body?.name,
        permission: permissions.filter((item) =>
          (params.body?.permissionIds ?? []).includes(item.id)
        ),
        menus: selectMenus(
          menuTree,
          new Set((params.body?.menuIds ?? []).map(Number))
        ),
      };
      roles.push(role);
      return role;
    },
  },
  {
    url: '/api/role',
    method: 'patch',
    response: (params: { body: any }) => {
      const role = roles.find(
        (item) => item.id === Number(params.body?.id)
      );
      if (!role) {
        throw new HttpException('角色不存在', HttpStatus.NOT_FOUND);
      }
      if (params.body?.name) {
        role.name = params.body.name;
      }
      if (params.body?.permissionIds) {
        role.permission = permissions.filter((item) =>
          params.body.permissionIds.includes(item.id)
        );
      }
      if (params.body?.menuIds) {
        role.menus = selectMenus(
          menuTree,
          new Set(params.body.menuIds.map(Number))
        );
      }
      return role;
    },
  },
  {
    url: '/api/role/:id',
    method: 'delete',
    response: (params: { params: Record<string, string> }) => {
      const id = Number(params.params?.id);
      const index = roles.findIndex((item) => item.id === id);
      if (index < 0) {
        throw new HttpException('角色不存在', HttpStatus.NOT_FOUND);
      }
      if ([adminUser].some((user) => user.role.some((r) => r.id === id))) {
        throw new HttpException('角色仍被用户引用', HttpStatus.CONFLICT);
      }
      return roles.splice(index, 1)[0];
    },
  },
  {
    url: '/api/menu',
    method: 'get',
    response: () => menuTree,
  },
  {
    url: '/api/menu',
    method: 'post',
    response: (params: { body: any }) => {
      const roleMenuIds = snapshotRoleMenuIds();
      const item: MockMenuNode = {
        id: nextRecordId(flattenMenus(menuTree)),
        label: params.body?.name,
        url: params.body?.path,
        component: params.body?.component,
        customIcon: params.body?.icon ?? '',
        menuType: params.body?.menuType ?? 'normal',
        parentId: params.body?.parentId ?? null,
        order: params.body?.order ?? 0,
        locale: params.body?.locale,
        children: [],
      };
      if (item.parentId === null) {
        menuTree.push(item);
      } else {
        const parent = findMenuLocation(menuTree, Number(item.parentId));
        if (!parent) {
          throw new HttpException('父菜单不存在', HttpStatus.NOT_FOUND);
        }
        parent.node.children.push(item);
      }
      syncRoleMenus(roleMenuIds);
      return item;
    },
  },
  {
    url: '/api/menu',
    method: 'patch',
    response: (params: { body: any }) => {
      const roleMenuIds = snapshotRoleMenuIds();
      const location = findMenuLocation(
        menuTree,
        Number(params.body?.id)
      );
      if (!location) {
        throw new HttpException('菜单不存在', HttpStatus.NOT_FOUND);
      }
      const index = location.siblings.indexOf(location.node);
      location.siblings.splice(index, 1);
      Object.assign(location.node, {
        label: params.body?.name ?? location.node.label,
        url: params.body?.path ?? location.node.url,
        component: params.body?.component ?? location.node.component,
        customIcon: params.body?.icon ?? location.node.customIcon,
        menuType: params.body?.menuType ?? location.node.menuType,
        parentId: params.body?.parentId ?? null,
        order: params.body?.order ?? location.node.order,
        locale: params.body?.locale ?? location.node.locale,
      });
      if (location.node.parentId === null) {
        menuTree.push(location.node);
      } else {
        const parent = findMenuLocation(
          menuTree,
          Number(location.node.parentId)
        );
        if (!parent) {
          location.siblings.splice(index, 0, location.node);
          throw new HttpException('父菜单不存在', HttpStatus.NOT_FOUND);
        }
        parent.node.children.push(location.node);
      }
      syncRoleMenus(roleMenuIds);
      return location.node;
    },
  },
  {
    url: '/api/menu',
    method: 'delete',
    response: (params: { query: any }) => {
      const roleMenuIds = snapshotRoleMenuIds();
      const location = findMenuLocation(
        menuTree,
        Number(params.query?.id)
      );
      if (!location) {
        throw new HttpException('菜单不存在', HttpStatus.NOT_FOUND);
      }
      const index = location.siblings.indexOf(location.node);
      const removed = location.siblings.splice(index, 1)[0];
      const parentId = Number(params.query?.parentId);
      const target =
        parentId === -1
          ? menuTree
          : findMenuLocation(menuTree, parentId)?.node.children;
      if (target) {
        removed.children.forEach((child) => {
          child.parentId = parentId === -1 ? null : parentId;
          target.push(child);
        });
      }
      roleMenuIds.forEach((ids) => ids.delete(removed.id));
      syncRoleMenus(roleMenuIds);
      return removed;
    },
  },
  {
    url: '/api/i18',
    method: 'get',
    response: (params: { query: any }) => {
      const languageIds = new Set(
        String(params.query?.lang ?? '')
          .split(',')
          .filter(Boolean)
          .map(Number)
      );
      const records = localeRecords.filter(
        (item) =>
          includesName(item.key, params.query?.key) &&
          includesName(String(item.content), params.query?.content) &&
          (!languageIds.size || languageIds.has(item.lang.id))
      );
      if (
        params.query?.all !== undefined &&
        String(params.query.all) !== '0'
      ) {
        return paginate(records, { page: 1, limit: Math.max(1, records.length) });
      }
      return paginate(records, params.query);
    },
  },
  {
    url: '/api/i18',
    method: 'post',
    response: (params: { body: any }) => {
      const language = languages.find(
        (item) => item.id === Number(params.body?.lang)
      );
      if (!language) {
        throw new HttpException('语言不存在', HttpStatus.NOT_FOUND);
      }
      const record: MockLocaleRecord = {
        id: nextRecordId(localeRecords),
        key: params.body?.key,
        content: params.body?.content,
        lang: language,
      };
      localeRecords.push(record);
      writeFormattedLocale(record);
      return record;
    },
  },
  {
    url: '/api/i18/batch',
    method: 'post',
    response: (params: { body: any }) => {
      const ids = Array.isArray(params.body)
        ? params.body
        : params.body?.ids ?? [];
      const removed = localeRecords.filter(
        (item) => ids.includes(item.id) || ids.includes(String(item.id))
      );
      removed.forEach(removeFormattedLocale);
      removed.forEach((record) => {
        const index = localeRecords.indexOf(record);
        if (index > -1) {
          localeRecords.splice(index, 1);
        }
      });
      return removed;
    },
  },
  {
    url: '/api/i18/:id',
    method: 'patch',
    response: (params: { body: any; params: Record<string, string> }) => {
      const record = localeRecords.find(
        (item) => item.id === Number(params.params?.id)
      );
      if (!record) {
        throw new HttpException('词条不存在', HttpStatus.NOT_FOUND);
      }
      const language =
        params.body?.lang === undefined
          ? record.lang
          : languages.find(
              (item) => item.id === Number(params.body.lang)
            );
      if (!language) {
        throw new HttpException('语言不存在', HttpStatus.NOT_FOUND);
      }
      removeFormattedLocale(record);
      Object.assign(record, {
        content: params.body?.content ?? record.content,
        key: params.body?.key ?? record.key,
        lang: language,
      });
      writeFormattedLocale(record);
      return record;
    },
  },
  {
    url: '/api/i18/:id',
    method: 'delete',
    response: (params: { params: Record<string, string> }) => {
      const index = localeRecords.findIndex(
        (item) => item.id === Number(params.params?.id)
      );
      if (index < 0) {
        throw new HttpException('词条不存在', HttpStatus.NOT_FOUND);
      }
      const record = localeRecords.splice(index, 1)[0];
      removeFormattedLocale(record);
      return record;
    },
  },
  {
    url: '/api/i18/format',
    method: 'get',
    response: (params: { query: any }) => {
      const lang = params.query?.lang;
      if (!lang) {
        return localeTable;
      }
      return { [lang]: localeTable[lang] ?? {} };
    },
  },
  {
    url: '/api/lang',
    method: 'get',
    response: () => languages,
  },
  {
    url: '/api/lang',
    method: 'post',
    response: (params: { body: any }) => {
      const name = params.body?.name;
      if (!name) {
        throw new HttpException('语言名不能为空', HttpStatus.BAD_REQUEST);
      }
      if (languages.some((item) => item.name === name)) {
        throw new HttpException('语言已存在', HttpStatus.CONFLICT);
      }
      const language = { id: nextRecordId(languages), name };
      languages.push(language);
      localeTable[name] ??= {};
      return language;
    },
  },
  {
    url: '/api/lang/:id',
    method: 'patch',
    response: (params: { body: any; params: Record<string, string> }) => {
      const language = languages.find(
        (item) => item.id === Number(params.params?.id)
      );
      if (!language) {
        throw new HttpException('语言不存在', HttpStatus.NOT_FOUND);
      }
      const name = params.body?.name;
      if (name && name !== language.name) {
        if (languages.some((item) => item.name === name)) {
          throw new HttpException('语言已存在', HttpStatus.CONFLICT);
        }
        localeTable[name] = localeTable[language.name] ?? {};
        delete localeTable[language.name];
        language.name = name;
        localeRecords.forEach((record) => {
          if (record.lang.id === language.id) {
            record.lang = { id: language.id, name };
          }
        });
      }
      return language;
    },
  },
  {
    url: '/api/lang/:id',
    method: 'delete',
    response: (params: { params: Record<string, string> }) => {
      const index = languages.findIndex(
        (item) => item.id === Number(params.params?.id)
      );
      if (index === -1) {
        throw new HttpException('语言不存在', HttpStatus.NOT_FOUND);
      }
      const language = languages[index];
      const removed = languages.splice(index, 1)[0];
      delete localeTable[language.name];
      for (let i = localeRecords.length - 1; i >= 0; i -= 1) {
        if (localeRecords[i].lang.id === language.id) {
          localeRecords.splice(i, 1);
        }
      }
      return removed;
    },
  },
] as const;
