---
title: "国际化"
---

<h1 id='internation'>国际化</h1> 

---
`TinyPro of Vue`通过在`src/locale`的文件夹下添加不同语言的 ts 文件，引入`Vue`的国际化方案`vue-i18n`来实现国际化的相关功能。


<h2 id='installation'>安装</h2>

```bash
npm install vue-i18n --save
```

<h2 id='contents'>目录结构</h2>

```bash
.
├── src/
│   └── locale/
│       │    │── en-US/    (存放所有模块的英文翻译文件)
│       │    │── zh-CN/    (存放所有模块的中文翻译文件)
│       │    │── en-US.ts
│       │    └── zh-CN.ts
```

<h2 id='code'>添加国际化代码</h2>

修改`Vue`应用入口文件`main.ts`。

```typescript
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

添加切换国际化逻辑文件&&国际化文件引入，应用入口文件`locale/index.ts`。

```typescript
import { createI18n } from 'vue-i18n';
import locale from '@opentiny/vue-locale'; // tiny-vue的国际化
import en from './en-US';
import cn from './zh-CN';

export const LOCALE_OPTIONS = [
  { label: '中文', value: 'zhCN' },
  { label: 'English', value: 'enUS' },
];

const i18nmode = (option: any) => {
  option.legacy = false;
  return createI18n(option);
};

export default (i18n: any) =>
  locale.initI18n({
    globalInjection: true,
    i18n,
    createI18n: i18nmode,
    messages: {
      enUS: en,
      zhCN: cn,
    },
  });
```

<h2 id='file'>编写国际化文件</h2>

在中文`zh-CN`文件夹下新建模块对应的文件

```typescript
export default {
  'settings.title': '页面配置',
  'settings.themeColor': '主题色',
  'settings.content': '内容区域',
  'settings.search': '搜索',
  'settings.language': '语言',
  'settings.navbar': '导航栏',
  'settings.menuWidth': '菜单宽度 (px)',
  'settings.navbar.alerts': '消息通知',
  'settings.navbar.help': '帮助中心',
  'settings.menu': '菜单栏',
  'settings.tabBar': '多页签',
  'settings.footer': '底部',
  'settings.otherSettings': '其他设置',
  'settings.colorWeek': '主题配置',
  'settings.alertContent':
    '配置之后仅是临时生效，要想真正作用于项目，点击下方的 "复制配置" 按钮，将配置替换到 settings.json 中即可。',
  'settings.copySettings': '复制配置',
  'settings.copySettings.message':
    '复制成功，请粘贴到 src/settings.json 文件中',
  'settings.close': '关闭',
  'settings.color.tooltip':
    '根据主题颜色生成的 10 个梯度色（将配置复制到项目中，主题色才能对亮色 / 暗黑模式同时生效）',
  'setting.user.set': '用户设置',
  'setting.loginout': '登出成功',
};

....
```

在`zh-CN.ts`文件中引入对应的文件：

```typescript
import localeLogin from '@/views/login/locale/zh-CN';
import localeTheme from '@/components/theme/locale/zh-CN';


export default {
  ...localeTheme,
  ...localeLogin,
};

```

同理在英文的`en-US`文件夹下新建模块补充对应的英文翻译，并在`en-US.ts`的文件中引入。
