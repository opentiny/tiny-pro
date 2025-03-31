import { useMenuStore } from '@/store/modules/router';
import { nextTick } from 'vue';
import { Router, RouteRecordRaw } from 'vue-router';
import NotFound from '@/views/not-found/404/index.vue';
import constant from '../constant';

export interface ITreeNodeData {
  // node-key='id' 设置节点的唯一标识
  id: number | string;
  // 节点显示文本
  label: string;
  // 子节点
  children?: ITreeNodeData[];
  // 链接
  url: string;
  // 组件
  component: string;
  // 图标
  customIcon: string;
  // 类型
  menuType: string;
  // 父节点
  parentId: number;
  // 排序
  order: number;
  // 国际化
  locale: string;
}
const reg = /\.vue$/gim;
let views = {} as any;
if (BUILD_TOOLS === 'WEBPACK') {
  views = import.meta.webpackContext('../../views', {
    recursive: true,
    regExp: /\.vue$/,
    mode: 'sync',
  });
  views.keys().forEach((path) => {
    if (path.endsWith('.vue')) {
      views[`../../views/${path.replace('./', '')}`] = views(path).default;
    }
  });
}
if (BUILD_TOOLS === 'VITE') {
  views = import.meta.glob('../../views/**/*.vue');
} else if (BUILD_TOOLS === 'RSPACK') {
  const components = require.context('../../views', true, reg, 'sync');
  components.keys().forEach((path) => {
    if (path.endsWith('.vue')) {
      views[`../../views/${path.replace('./', '')}`] = components(path).default;
    }
  });
}

export const flushRouter = async (router: Router) => {
  const menuStore = useMenuStore();
  router.clearRoutes();
  constant.forEach((staticRoute) => router.addRoute(staticRoute));
  await menuStore.getMenuList();
  const routes = toRoutes(menuStore.menuList);
  routes.forEach((route) => {
    router.addRoute('root', route);
  });
};

export const toRoutes = (menus: ITreeNodeData[]) => {
  const router: RouteRecordRaw[] = [];
  for (let i = 0; i < menus.length; i += 1) {
    const menu = menus[i];
    const path = `../../views/${menu.component}${menu.component.includes('.vue') ? '' : '.vue'}`;
    if (!views[path]) {
      router.push({
        name: menu.label,
        path: menu.url,
        component: NotFound,
        children: [...toRoutes(menu.children ?? [])],
        meta: {
          locale: menu.locale,
          requiresAuth: true,
        },
      });
    } else {
      router.push({
        name: menu.label,
        path: menu.url,
        component: views[path],
        children: [...toRoutes(menu.children ?? [])],
        meta: {
          locale: menu.locale,
          requiresAuth: true,
        },
      });
    }
  }
  return router;
};

export const setupMenuGuard = (router: Router) => {
  let has404 = false;
  router.beforeEach(async (to, from, next) => {
    if (to.name?.toString().toLowerCase() === 'login') {
      next();
      return;
    }
    if (!has404) {
      has404 = true;
      router.addRoute({
        path: `${import.meta.env.VITE_CONTEXT}:pathMatch(.*)*`,
        name: 'notFound',
        component: () => import('@/views/not-found/index.vue'),
      });
    }
    await nextTick();
    const menuStore = useMenuStore();
    if (menuStore.menuList.length) {
      next();
      return;
    }
    const data = await menuStore.getMenuList();
    const routes = toRoutes(data);
    routes.forEach((route) => {
      if (!router.hasRoute(route.name)) {
        router.addRoute('root', route);
      }
    });
    next({ ...to, replace: true });
  });
};
