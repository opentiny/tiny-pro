---
title: "布局"
---

<h1 id='layout'>布局</h1> 

---
`TinyPro of Vue`为页面开发提供了布局组件，并在页面集成常见的布局模式，可快速调整页面的布局方式。


<h2 id='components'>布局组件</h2>

```html
<tiny-container>
  <template #header>
    <tiny-layout>
      <!-- 头部区域 -->
    </tiny-layout>
  </template>
  <template #aside>
    <tiny-layout class="layout-sider">
      <!-- 侧边栏区域 -->
    </tiny-layout>
  </template>
  <tiny-layout class="layout-content">
    <!-- 内容区域 -->
  </tiny-layout>
  <template #footer>
    <tiny-layout>
      <!-- 页脚区域 -->
    </tiny-layout>
  </template>
</tiny-container>
```

<h2 id='adjust'>布局调整</h2>

- 修改`src/layout/default-layout.config.ts`属性信息文件，可修改页面的布局。

```ts
  // 是否显示切换框架结构
  const myPattern = ref('legend');
```

- 此外我们还提供了界面来展示多种布局的切换，通过选择不同的布局方式，你可以在线查看当前页面布局的切换效果。

![layout.png](/images/set.png)


