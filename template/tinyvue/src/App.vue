<template>
  <div>
    <tiny-config-provider :design="design">
      <router-view />
    </tiny-config-provider>

    <global-setting />
  </div>
</template>

<script lang="ts" setup>
  import { provide } from 'vue';
  import * as echarts from 'echarts';
  import { TinyConfigProvider } from '@opentiny/vue';
  import GlobalSetting from '@/components/global-setting/index.vue';
  import TinyThemeTool from '@opentiny/vue-theme/theme-tool';
  import { useTheme } from './hooks/useTheme';

  const theme = new TinyThemeTool();
  useTheme(theme);

  const design = {
    name: 'x-design', // 设计规范名称
    version: '1.0.0', // 设计规范版本号
    components: {
      Button: {
        props: {
          resetTime: 0,
          round: true,
        },
      },
    },
  };
</script>

<style lang="less" scoped>
  @import '@/assets/style/menu.less'; /* 引入公共样式 */
</style>
