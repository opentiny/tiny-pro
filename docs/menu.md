---
title: "路由与菜单"
---

<h1 id='menu'>路由和菜单</h1>


---
在用户使用应用程序时，Vue 的路由器能让用户从一个视图导航到另一个视图。

<h2 id='function'>核心模块和功能</h2>

- #### 导航

  在`src/router/routes/modules`中根据你的路由进行配置。

- #### 路由管理

  - **1.主路由**  
    在`src/router/index`中进行配置。

  - **2.页面路由**  
    在`src/router/routes/modules`中进行配置。


- #### 面包屑

  可以参考`src/compoments/breadcrumb`中进行配置。

<h2 id='导航'>导航</h2>

导航的相关内容可以在`src/router/routes/modules`中进行修改。
`menu`数据格式如下所示：

```ts
export default {
  path: 'form',
  name: 'Form',
  id: 'Form',
  label: 'Form',
  component: () => import('@/views/form/index.vue'),
  meta: {
    locale: 'menu.form',
    icon: 'icon-settings',
    requiresAuth: true,
    order: 3,
  },
  children: [
    {
      path: 'base',
      name: 'Base',
      id: 'Base',
      label: 'Base',
      component: () => import('@/views/form/base/index.vue'),
      meta: {
        locale: 'menu.form.base',
        requiresAuth: true,
        roles: ['admin'],
      },
    },
    {
      path: 'step',
      name: 'Step',
      id: 'Step',
      label: 'Step',
      component: () => import('@/views/form/step/index.vue'),
      meta: {
        locale: 'menu.form.step',
        requiresAuth: true,
        roles: ['admin'],
      },
    },
  ],
};

```

`注意：在国际化文件中补充对应的修改内容`

<h2 id='icon'>在导航中使用<code>TinyVue</code>的图标</h2>

> 在`menu.ts`中为配置项`menuIcon`传入`TinyVue`Icon 组件的对应图标名称即可。

<h2 id='router'>路由</h2>

项目中的路由分为主路由、页面路由详细配置如下：  
主路由的配置文件在`src/router/index`

```ts
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: import.meta.env.VITE_CONTEXT + 'login',
    },
    {
      path: '/' + import.meta.env.VITE_CONTEXT,
      redirect: import.meta.env.VITE_CONTEXT + 'board/work',
    },
    {
      path: import.meta.env.VITE_CONTEXT + 'login',
      name: 'login',
      component: () => import('@/views/login/index.vue'),
      meta: {
        requiresAuth: false,
      },
    },
    {
      name: 'root',
      path: import.meta.env.VITE_CONTEXT,
      component: DefaultLayout,
      children: appRoutes,
    },
    {
      path: import.meta.env.VITE_CONTEXT + ':pathMatch(.*)*',
      name: 'notFound',
      component: () => import('@/views/not-found/index.vue'),
    },
  ],
});

export default router;

```

页面路由的配置文件`src/router/routes/modules`格式为：

```ts
export default {
  path: 'form',
  name: 'Form',
  id: 'Form',
  label: 'Form',
  component: () => import('@/views/form/index.vue'),
  meta: {
    locale: 'menu.form',
    icon: 'icon-settings',
    requiresAuth: true,
    order: 3,
  },
  children: [
    {
      path: 'base',
      name: 'Base',
      id: 'Base',
      label: 'Base',
      component: () => import('@/views/form/base/index.vue'),
      meta: {
        locale: 'menu.form.base',
        requiresAuth: true,
        roles: ['admin'],
      },
    },
    {
      path: 'step',
      name: 'Step',
      id: 'Step',
      label: 'Step',
      component: () => import('@/views/form/step/index.vue'),
      meta: {
        locale: 'menu.form.step',
        requiresAuth: true,
        roles: ['admin'],
      },
    },
  ],
};
```


<h2 id='breadcrumb'>面包屑</h2>

通过 Breadcrumb 面包屑组件`tiny-breadcrumb`实现，面包屑组件除最后一级外，其余几级一般都为可跳转的链接，链接地址可以通过 href 属性设置; 用户也可通过添加事件，实现业务逻辑, 如下所示：

```html
  <tiny-breadcrumb class="container-breadcrumb">
    <tiny-breadcrumb-item v-for="item in items" :key="item">
      {{ $t(item) }}
    </tiny-breadcrumb-item>
  </tiny-breadcrumb>
```

对应的 ts 文件：

```ts
  import { PropType } from 'vue';
  import {
    Breadcrumb as TinyBreadcrumb,
    BreadcrumbItem as TinyBreadcrumbItem,
  } from '@opentiny/vue';

  defineProps({
    items: {
      type: Array as PropType<string[]>,
      default() {
        return [];
      },
    },
  });
```
