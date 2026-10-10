---
title: "新增页面"
---

<h1 id='page'>新增页面</h1>

---

如果你想通过导航栏访问一个新页面，可通过此方法进行操作。新建页面的主要流程为在 `src/view` 目录中创建对应页面，
然后在模块中创建对应的组件，如果组件中需创建公共组件，则在 `src/components` 中创建。  下面以新建**结果页**为例，介绍新建页面的流程。


<h2 id='modal'>创建模块</h2>

首先在`src/view`下新建一个页面：

 ![result.png](/images/routercode.png)


<h2 id='request'>增加路由访问</h2>

以上步骤完成后，需要为新增的页面在导航栏中添加对应的路由访问。

在 `src/router/moudles`中，添加路由信息。

```ts
export default {
  path: 'result',
  name: 'Result',
  id: 'Result',
  label: 'Result',
  component: () => import('@/views/result/index.vue'),
  meta: {
    locale: 'menu.result',
    icon: 'icon-check-circle',
    requiresAuth: true,
    order: 5,
  },
  children: [
    {
      path: 'success',
      name: 'Success',
      id: 'Success',
      label: 'Success',
      component: () => import('@/views/result/success/index.vue'),
      meta: {
        locale: 'menu.result.success',
        requiresAuth: true,
        roles: ['admin'],
      },
    },
    {
      path: 'error',
      name: 'Error',
      id: 'Error',
      label: 'Error',
      component: () => import('@/views/result/error/index.vue'),
      meta: {
        locale: 'menu.result.error',
        requiresAuth: true,
        roles: ['admin'],
      },
    },
  ],
};
```

<h2 id='visible'>新增页面展示</h2>

 ![page.png](/images/result.png)


