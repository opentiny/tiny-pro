<template>
  <div>
    <router-view />
    <global-setting />
  </div>
</template>

<script lang="ts" setup>
  import GlobalSetting from '@/components/global-setting/index.vue';
  import TinyThemeTool from '@opentiny/vue-theme/theme-tool';
  import { useTheme } from './hooks/useTheme';

  const theme = new TinyThemeTool();
  useTheme(theme);
</script>

<style lang="less" scoped>
  @import '@/assets/style/menu.less'; /* 引入公共样式 */
</style>
