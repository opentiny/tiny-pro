# Tiny Pro 移动端适配说明

本文档概述 Tiny Pro 在移动端上的适配基线、 工具与用法、样式与编码策略、常用代码片段等方面内容，便于在新增页面或组件时保持一致的移动体验与质量。

## 1. 适配基线

- **断点规范（UnoCSS）**

  配置位置：`template/tinyvue/uno.config.ts`

  ```ts
  const breakpoints = {
    sm: '641px',     // 手机（小屏，iPhone SE、Mini 等）
    md: '769px',     // 平板（竖屏，iPad Mini、iPad 等）
    lg: '1025px',    // 平板横屏 / 小型笔记本（iPad 横屏、Surface Go）
    xl: '1367px',    // 笔记本主流分辨率（MacBook Air、13寸笔记本）
    '2xl': '1441px', // 高分辨率笔记本（MacBook Pro 14、部分高清显示器）
    '3xl': '1921px', // 全高清显示器 / 桌面大屏（1080p 显示器）
  }
  ```

  为了保持PC端的使用体验，采用了“PC端优先”的适配策略。而UnoCSS 默认支持的是 `sm:`, `md:` 这类 min-width 媒体查询。，所以在`uno.config.ts`定义了max-<bp>:` 变体，以支持 max-width 媒体查询，例如：`max-sm:` → `@media (max-width: 640px)`。



## 2. 工具与用法

- **UnoCSS 原子类 + 断点前缀**:
  
  - 最小宽度断点：`sm:`, `md:`, `lg:` 等，例如：`sm:px-4 md:px-6 lg:px-8`。
  - 最大宽度断点：`max-sm:`, `max-md:` 等，例如：`max-sm:text-center`。
  - Attributify 语法可选：`<div text="sm:left md:center" p="sm:4 lg:8" />`。
  
- **响应式 Hook**（`template/tinyvue/src/hooks/responsive.ts`）:
  
  - `useResponsive({ sm: 375, md: 768, lg: 1024 })` 返回 `sm/md/lg` 三个 `ref`，用于在脚本层判断断点。
  - `useResponsiveSize()` 提供 `gridSize`、`modalSize`：在较小屏幕下使表单/弹层更紧凑，`modalSize` 小屏为 `100%`，大屏为 `768px`。
  
  ```ts
  const { sm, md, lg } = useResponsive()
  const { gridSize, modalSize } = useResponsiveSize()
  ```
  
- **常用逻辑**

  `gridSize`：小屏 → `mini`，大屏 → `medium`
  
   `modalSize`：小屏 → `100%`，大屏 → `768px`



## 3. 样式与编码策略

- **优先级**
  - 简单场景：使用 UnoCSS 原子类。
  
  - 复杂样式：使用 Less 媒体查询。
  
- **布局与滚动**
  - 首页及核心业务模块完成适配，小屏模式下侧边栏默认收起、导航栏折叠，确保主要内容可见。  
  - 页面主要容器避免横向滚动，必要时在小屏下开启局部横向滚动。  
  - 表格与大区块在不同断点下自动调整宽度、栅格与间距，小屏下支持横向滚动；分页与密度支持响应式控制。  
  
- **图表自适应**
  - 图表组件接入 `resize` 监听，在侧边栏展开/收起、窗口缩放、语言切换等场景下保持自适应。  
  
  - 小屏下使用 `vw` 宽度与较小字号，保证图表展示效果与可读性。  


- **表单与模态框**

  - 接入 `useResponsiveSize()`，控制弹窗在小屏下铺满显示，大屏保持固定宽度。  

  - 表单项在不同断点下动态调整排布与间距，优化触控体验。  


- **导航与交互**

  - 小屏下隐藏导航栏非关键元素，操作聚合到"折叠菜单"。  

  - 移动端默认收起侧边菜单栏，提升主要内容展示区域。  


- **性能优化**
  - 在 `responsive.ts` 中对 `resize` 事件处理增加节流机制，避免窗口缩放等场景下的频繁无效渲染。



## 4. 常用代码片段

1. 基于栅格系统 + 响应式断点工具类，通过为 tiny-row 和 tiny-col 添加不同屏幕宽度下的样式规则，实现自适应布局：

```vue
<tiny-layout>
    <tiny-row class="flex justify-center max-md:flex-wrap">
        <tiny-col class="w-1/4 max-md:w-1/2 max-sm:w-full max-md:mb-4">···</tiny-col>
        ···
        <tiny-col class="w-1/4 max-md:w-1/2 max-sm:w-full max-md:mb-4">···</tiny-col>
    </tiny-row>
</tiny-layout>

```
```vue
<div class="theme-line flex max-sm:grid max-sm:grid-cols-4 max-sm:gap-2">
  <div···
  </div>
</div>
```

2. 基于 响应式工具类 + 自定义响应式 Hook,解决(1)对话框宽度自适应;(2)表格尺寸和密度自适应;(3)逻辑层响应式控制

```vue
<template>
  <section class="p-4 sm:p-6 lg:p-8 max-sm:text-center">
    <tiny-dialog :width="modalSize">...</tiny-dialog>
  </section>
</template>

<script setup lang="ts">
import { useResponsiveSize } from '@/hooks/responsive'
const { modalSize } = useResponsiveSize() // 小屏 100%，大屏 768px
</script>
```

```vue
<template>
  <div class="container">
    <tiny-grid ref="grid" :fetch-data="fetchDataOption" :pager="pagerConfig" :size="gridSize" :auto-resize="true" align="center">
      ···
    </tiny-grid>
  </div>
</template>

<script setup lang="ts">
import { useResponsiveSize } from '@/hooks/responsive'
const { gridSize } = useResponsiveSize() // 小屏为mini grid，大屏为medium grid
</script>
```

3. 通过 `useResponsive` 获取屏幕断点状态 `sm/md/lg`，如：在模板中结合 `v-if="!lg"` 控制分隔线的渲染，从而实现了小屏下纵向菜单才显示分隔线的效果

```vue
<template>
  <ul class="right-side" :class="{ open: menuOpen }">
    <!-- 小屏下才显示分隔线 -->
    <li v-if="!lg">
      <div class="divider"></div>
    </li>
    ···
  </ul>
</template>

<script lang="ts" setup>
import { useResponsive } from '@/hooks/responsive'
const { lg } = useResponsive()
</script>
```



## 5. 测试与验证

### 5.1 自动化校验（Playwright）

#### 测试用例

本项目主要通过Playwright E2E自动化测试、移动端模拟器和真实移动端浏览器验证的方式，对TinyPro前端在移动端的适配效果进行了系统性验证。测试内容涵盖了页面布局、交互体验、业务流程及异常处理，确保移动端的使用体验与桌面端保持一致，并符合预期的设计目标。以下为部分关键测试用例及其验证结果：

| 测试用例编号 | 测试目标                   | 测试方法 / 操作步骤                                          | 预期结果                                                   | 实际结果 | 验证结论 |
| ------------ | -------------------------- | ------------------------------------------------------------ | ---------------------------------------------------------- | -------- | -------- |
| TC-01        | 移动端侧边菜单栏折叠与展开 | 模拟 iPhone 12 viewport，点击侧边栏按钮，断言侧边栏是否可见  | 移动端侧边菜单栏默认隐藏，点击按钮后正常显示，动画执行顺畅 | 符合预期 | 通过     |
| TC-02        | 移动端列表横向滚动加载     | 模拟 iPhone 12 viewport，滚动列表到底部，检查新增 DOM 元素出现 | 新数据正常追加，滚动条无抖动                               | 符合预期 | 通过     |
| TC-03        | 移动端表格 size 为 mini    | 模拟 iPhone 12 viewport，进入“监控页”，查看表格的样式以及 class | 移动端表格的 class 包含 size_mini，布局更紧凑              | 符合预期 | 通过     |
| TC-04        | 移动端模态框响应式布局     | 模拟 iPhone 12 viewport，点击“查看菜单”页的“创建菜单”按钮    | 移动端模态框宽度为 100%                                    | 符合预期 | 通过     |
| TC-05        | 导航栏折叠菜单交互验证     | 模拟 iPhone 12 viewport，在移动端点击折叠菜单，断言二级菜单是否可见 | 非关键操作聚合到折叠菜单中，菜单展开/收起正常              | 符合预期 | 通过     |

### 5.2 人工验证

- 开发者工具设备模拟（iPhone/Android 多机型）。
- 关键页面（登录、首页、表格、图表、表单/弹层）在真机检查。

| 测试用例编号 | 测试目标                      | 测试方法 / 操作步骤                                          | 预期结果                                                     | 实际结果 | 验证结论 |
| ------------ | ----------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ | -------- | -------- |
| TC-06        | 图表在移动端的自适应          | 手动模拟 iPhone 12 viewport，切换侧边栏收起/展开，检查图表宽度 | 图表随容器宽度变化自适应，无溢出，label 字号在小屏正常显示   | 符合预期 | 通过     |
| TC-07        | 页面横向滚动可控性            | 手动模拟 iPhone 12 viewport，检查页面是否出现整体横向滚动    | 页面主容器无横向滚动条，仅在表格/大区块等必要区域允许横向滚动 | 符合预期 | 通过     |
| TC-08        | 响应式性能（resize 节流验证） | 手动拖动浏览器宽度，检查页面重绘/卡顿情况                    | 页面可平滑缩放，无明显卡顿或频繁无效渲染                     | 符合预期 | 通过     |

**测试结论：**通过上述测试验证，移动端的主要功能、页面适配和交互均符合设计预期，未发现严重问题。结合Playwright自动化用例的覆盖和实际设备验证结果，可以确认TinyPro在移动端环境下具备良好的稳定性与可用性。



## 6. 扩展与规范化

- 如需新增或调整断点：
  - UnoCSS：修改 `template/tinyvue/uno.config.ts` 中的 `breakpoints`，同时考虑是否需要对应 `max-<bp>:` 变体。
- 统一实践：
  - 优先使用 Uno 原子类进行简单的响应式布局；当样式逻辑复杂时再落到 Less 媒体查询。
  - 以“桌面端优先”为设计基线：先实现 PC 布局，再通过断点类覆盖到平板和手机，保持布局逻辑的可读性。
  - 组件脚本层通过 `useResponsive` 控制功能性差异（如图表尺寸、分页大小、模态框尺寸等等）。
  - 在`template\tinyvue\src\hooks\responsive.ts`中封装统一的响应式 Hook，提升复用性与可维护性。

