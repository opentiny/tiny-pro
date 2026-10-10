---
title: "权限控制"
---

<h1 id='role'>权限管理</h1>

---

`TinyPro of Vue`通过在`src/store/moudles/user`文件结合路由，建立`switchRoles`方法来实现角色权限管理的。

<h2 id='achieve'>项目使用方式</h2>


<h3 id='roles'>路由中设置角色显示标签[roles]</h3>

```ts
export default {
  path: 'exception',
  name: 'Exception',
  id: 'Exception',
  label: 'Exception',
  component: () => import('@/views/exception/index.vue'),
  meta: {
    locale: 'menu.exception',
    requiresAuth: true,
    icon: 'icon-exclamation-circle',
    order: 6,
  },
  children: [
    {
      path: '403',
      name: '403',
      id: '403',
      label: '403',
      component: () => import('@/views/exception/403/index.vue'),
      meta: {
        locale: 'menu.exception.403',
        requiresAuth: true,
        roles: ['admin'],
      },
    },
    {
      path: '404',
      name: '404',
      id: '404',
      label: '404',
      component: () => import('@/views/exception/404/index.vue'),
      meta: {
        locale: 'menu.exception.404',
        requiresAuth: true,
        roles: ['admin', 'user'],
      },
    },
    {
      path: '500',
      name: '500',
      id: '500',
      label: '500',
      component: () => import('@/views/exception/500/index.vue'),
      meta: {
        locale: 'menu.exception.500',
        requiresAuth: true,
        roles: ['admin', 'user'],
      },
    },
  ],
};

```

<h3 id='write'>store中书写`switchRoles`方法</h3>

```ts
    switchRoles() {
      return new Promise((resolve) => {
        this.role = this.role === 'user' ? 'admin' : 'user';
        resolve(this.role);
      });
    },
```

<h3 id='store'>页面中调用方法，来做到路由权限管理</h3>

```ts
  const switchRoles = async () => {
    const res = await userStore.switchRoles();
    Modal.message({
      message: res as string,
      status: 'success',
    });
  };
```


