---
title: "状态管理"
---

<h1 id='status'>状态管理</h1>

---

`TinyPro of Vue`通过在`src/store`的文件，引入`Pinia`来实现状态管理。

<h2 id='work'>准备工作</h2>

<h3 id='install'>安装依赖</h3>

```ts
npm install pinia -S
```

<h3 id='main'>main中注册</h3>

```ts
import { createApp } from 'vue';
import globalComponents from '@/components';
import router from './router';
import store from './store';
import i18n from './locale';
import directive from './directive';
import { setupProdMockServer } from './mockProdServer';
import './mock';
import App from './App.vue';
import '@/api/interceptor';
import '@/assets/style/global.less';

setupProdMockServer();

const app = createApp(App);

app.use(router);
app.use(store);
app.use(i18n({ locale: 'zhCN' }));
app.use(globalComponents);
app.use(directive);

app.mount('#app');
```

<h3 id='store'>建立store</h3>

```ts
import { createPinia } from 'pinia';
import useAppStore from './modules/app';
import useUserStore from './modules/user';
import useTabBarStore from './modules/tab-bar';

const pinia = createPinia();

export { useAppStore, useUserStore, useTabBarStore };
export default pinia;
```

<h2 id='project'>项目中使用</h2>

<h3 id='inject'>在使用页面中引入你的store</h3>

```ts
 import { useAppStore } from '@/store';
 const appStore = useAppStore();
```

<h3 id='action'>调用store中的action方法</h3>

```ts
appStore.updateSettings({ navbar: true, footer: true });
```
