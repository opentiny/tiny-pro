---
title: "Mock数据"
---

<h1 id='mock'>Mock 数据</h1>

---
支持不依赖后端，本地方便调试数据。


<h2 id='principle'>实现原理</h2>

实现前后端的我们需要将 data 文件和 service 文件分隔开。
在`TinyPro of Vue`中，我们在`src/api`中定义数据的类型，同时在`src/api`中实现相关的接口文件。

下面以登录为例，介绍 Mock 数据的使用。  

首先需要在`src/api/user.ts`文件中定义数据参数类型：

```ts
import axios from 'axios';
import { UserState } from '@/store/modules/user/types';

export interface LoginData {
  username: string;
  password: string;
}

export function login(data: LoginData) {
  return axios.post<LoginRes>('/api/user/login', data);
}
```

在`src/mock/user.ts`文件中我们实现接口定义具体要模拟的数据。

```ts
  {
    url: '/api/user/login',
    method: 'post',
    response: (params: MockParams) => {
      const { username, password } = JSON.parse(JSON.stringify(params.body));
      if (!username) {
        return failResponseWrap(null, '用户名不能为空', 50000);
      }
      if (!password) {
        return failResponseWrap(null, '密码不能为空', 50000);
      }
      if (username === 'admin' && password === 'admin') {
        window.localStorage.setItem('userRole', 'admin');
        return successResponseWrap({
          token: '12345',
        });
      }
      if (username === 'user' && password === 'user') {
        window.localStorage.setItem('userRole', 'user');
        return successResponseWrap({
          token: '54321',
        });
      }
      return failResponseWrap(null, '账号或者密码错误', 50000);
    },
  },
```

<h2 id='make'>项目中使用</h2>

在`src/views/login`中调用你的 service：

```ts
    async login(loginForm: LoginData) {
      try {
        const res = await userLogin(loginForm);
        setToken(res.data.token);
      } catch (err) {
        clearToken();
        throw err;
      }
    },
```


