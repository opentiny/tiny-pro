---
title: "总览"
---


<h1 id='overview'>总览</h1>

---
 **TinyPro of Vue** 是基于TinyVue组件库一整套企业级中后台前端/设计解决方案，致力于在设计规范和基础组件的基础上，
 继续向上构建，提炼出典型模板/业务组件/配套设计资源，进一步提升企业级中后台产品设计研发过程中的『用户』和『设计者』的体验。
 <br/>

你可以通过访问以下演示站点体验 TinyPro：[https://opentiny.github.io/tiny-pro](https://opentiny.github.io/tiny-pro)
 
 <h2 id='knowledge'>背景知识</h2>

`TinyPro of Vue`作为一个前端脚手架，默认读者已经懂了一些前端的基础知识，并且了解[`Vue`](https://cn.vuejs.org/)、[`Tiny Vue`](https://opentiny.design/tiny-vue)和[`TinyCLI`](https://opentiny.design/tiny-cli/home)。

<h2 id='Preparations'>准备工作</h2>

`TinyPro of Vue`前端脚手架是基于`TinyCLI`封装的套件，因此，首先要安装`TinyCLI`，您可点击此处获取[`TinyCLI`](https://opentiny.design/tiny-cli/docs/use-install)如何安装。

<h2 id='init'>初始化</h2>

我们提供了套件来快速的初始化脚手架。

```bash
tiny init pro
```

配置项目名称、项目描述、技术栈（选择"**vue**"）
```
 ? 请输入项目名称： 
 ? 请输入项目描述： (基于TinyPro套件创建的中后台系统)
 ? 请选择你希望使用的技术栈： (Use arrow keys)
 > vue
   angular
```

<h2 id='development'>开发</h2>

脚手架初始化成功之后就可以开始进行开发了，我们提供了一些命令来辅助开发。

***`tiny start`***

运行这个脚本会启动服务，自动打开默认浏览器展示你的页面。当你重新编辑代码后，页面还会自动刷新。

 ![start.webp](/images/start.webp)

***`tiny build`***

运行这个脚本将会编译你的项目，你可以在项目中的dist目录中找到编译后的文件用于部署。

 ![build.webp](/images/build.webp)