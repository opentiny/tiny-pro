<template>
  <div class="layout">
    <div>
      <div relative class="shadow-[0_4px_6px_#0003] z-[999]">
        <NavBar v-if="layoutMode[myPattern].navbar"/>
      </div>
      <div flex>
        <Suspense>
          <Menu v-if="reloadKey !== 'menu' && layoutMode[myPattern].menu" class="shadow-[0_4px_12px_#0000001a] z-[100]" />
        </Suspense>
        <div class="text-[#ccc] bg-[#f5f6f7] pl-[10px] pr-[10px] flex-1 h-[calc(100vh-60px)]" :style="{ width: isMenuCollapsed ? '100%' : 'calc(100% - 220px)' }">
          <PageLayout class="!h-[calc(100%-70px)] pl-4 pr-4" />
          <Footer v-if="layoutMode[myPattern].footer" class="h-[60px]" />
        </div>
      </div>
    </div>
    <div class="theme-box" @click="themeVisible">
      <img src="@/assets/images/theme.png" />
    </div>
    <div v-if="disTheme">
      <tiny-modal
        v-model="disTheme"
        :lock-scroll="true"
        show-header
        show-footer
        :title="$t('theme.title.main')"
        mask-closable="true"
        height="922"
        width="748"
      >
        <template #default>
          <Theme />
        </template>
        <template #footer></template>
      </tiny-modal>
    </div>
    <img
      v-if="!appStore.navbar"
      src="@/assets/images/global.png"
      class="global-setting"
      @click="switchSet"
    />
  </div>
</template>

<script lang="ts" setup>
  import { ref, watch, computed, nextTick, provide } from 'vue';
  import { useI18n } from 'vue-i18n';
  import {
    Modal as tinyModal,
    Tabs,
    TabItem,
    Modal,
  } from '@opentiny/vue';
  import TinyThemeTool from '@opentiny/vue-theme/theme-tool';
  import { useAppStore, useTabStore } from '@/store';
  import Footer from '@/components/footer/index.vue';
  import NavBar from '@/components/navbar/index.vue';
  import Theme from '@/components/theme/index.vue';
  import Menu from '@/components/menu/index.vue';
  import { useRouter } from 'vue-router';
  import { useTheme } from '@/hooks/useTheme';
  import locale from '@opentiny/vue-locale';
  import PageLayout from './page-layout.vue';

  // 动态切换
  const router = useRouter();
  const appStore = useAppStore();
  const footerColor = ref('#fff');

  const { t } = useI18n();
  const tabStore = useTabStore();

  const tabsHistory = computed(() => tabStore.data);
  const currentTabName = ref();

  const { isMenuCollapsed } = appStore;

  const reloadKey = ref('');
  const reloadMenu = () => {
    reloadKey.value = 'menu';
    nextTick(() => {
      reloadKey.value = '';
    });
  };
  const tabsRefreshKey = ref('');
  provide('RELOAD', {
    reloadMenu,
  });

  watch(
    () => tabStore.current,
    () => {
      currentTabName.value = tabStore.current?.link;
    },
    { deep: true, immediate: true },
  );

  const onClick = (tab: { name: string; link: string }) => {
    const routePaths = router.getRoutes().map((routeItem) => routeItem.path);
    if (!routePaths.includes(tab.name)) {
      Modal.message({
        message: locale.t('exception.result.404.description'),
        status: 'error',
      });
      const curName = tabStore.delByLink(tab.name);
      tabStore.set(curName);
      tabStore.$patch({
        current: tabStore.getByName(curName)[0],
      });
      currentTabName.value = tabStore.current?.link;
      tabsRefreshKey.value = '1';
      nextTick(() => {
        tabsRefreshKey.value = '';
      });
    } else {
      router.replace(tab.name);
    }
  };
  const onClose = (name: string) => {
    if (tabStore.data.length === 1) {
      return;
    }
    const routerPaths = router.getRoutes().map((r) => r.path);
    const deleteItemIndex = tabStore.data.findIndex(
      (item) => item.link === name,
    );
    let rightIdx = deleteItemIndex + 1;
    let leftIdx = deleteItemIndex - 1;
    let path = '';
    const deleteSelf = tabStore.data[deleteItemIndex] === tabStore.current;
    if (!deleteSelf) {
      tabStore.delByLink(name);
      return;
    }
    let curName = '';
    // 向右找到一个最近的路由项
    while (rightIdx < tabStore.data.length && !path) {
      const item = tabStore.data[rightIdx];
      if (routerPaths.includes(item.link)) {
        path = item.link;
        curName = item.name;
        break;
      }
      rightIdx += 1;
    }
    // 向左找到一个最近的路由
    while (leftIdx >= 0 && !path) {
      const item = tabStore.data[leftIdx];
      if (routerPaths.includes(item.link)) {
        path = item.link;
        curName = item.name;
        break;
      }
      leftIdx -= 1;
    }
    // 找不到存在的路由则不删除当前路由也不跳转
    if (leftIdx < 0 && rightIdx >= tabStore.data.length && !path) {
      return;
    }
    tabStore.delByLink(name);
    // 跳转到最近的一个合法路由
    tabStore.set(curName);
    router.push({ path });
  };

  // 切换简约模式，图标按钮
  const top = ref('10px');

  // 判断是否显示设置图标
  const switchSet = () => {
    appStore.updateSettings({ Settings: true });
  };

  // 是否显示切换框架结构
  const myPattern = ref('legend');

  const layoutMode = {
    // 传奇布局
    legend: {
      navbar: true,
      menu: true,
      footer: true,
    },
    // 简约布局
    simple: {
      navbar: false,
      menu: true,
      footer: false,
    },
    // 时尚布局
    fashion: {
      navbar: true,
      menu: true,
      footer: false,
    },
    // 经典布局
    classic: {
      navbar: true,
      menu: false,
      footer: true,
    },
    // 默认布局
    default: {
      navbar: true,
      menu: true,
      footer: false,
    },
  }

  // 主题配置
  const disTheme = ref(false);
  const theme = new TinyThemeTool();
  useTheme(theme);
  provide('THEME', theme);
  const themeVisible = () => {
    disTheme.value = !disTheme.value;
  };

  watch(appStore.$state, (newValue, oldValue) => {
    if (!newValue.navbar) {
      myPattern.value = 'simple';
    } else if (!newValue.footer) {
      myPattern.value = 'fashion';
    } else if (!newValue.menu) {
      myPattern.value = 'classic';
    } else {
      myPattern.value = 'legend';
    }
    appStore.footer ? (top.value = '10px') : (top.value = '60px');
  });

  watch(appStore.$state, (newValue, oldValue) => {
    if (newValue.theme === 'dark') {
      footerColor.value = '#262323;';
    } else {
      footerColor.value = '#fff;';
    }
  });
  // 初始化默认主题
</script>

<style scoped lang="less">
  .layout {
    width: 100%;
    height: 100%;
  }

  .global-setting {
    position: fixed;
    top: 280px;
    right: 0;
    z-index: 99;
    width: 30px;
    height: 30px;
  }

  // 组件无法固定非message的modal类型距离顶部距离
  :deep(.tiny-modal__box) {
    top: 8px !important;
  }

  // 路由子菜单选中后的样式
  :deep(.tiny-tree-node__children .tiny-tree-node__content) {
    .tree-node-name {
      margin-left: 28px !important;
      padding-left: 6px !important;
    }
  }

  :deep(.tiny-tree-node__children > .tree-node-body) {
    padding-left: 50px;
  }

  :deep(
    .tiny-container__main > .tiny-layout > .tiny-tabs > .tiny-tabs__content
  ) {
    display: none;
  }

  :deep(.tiny-tabs--top) {
    padding: 0 16px;
  }

  :deep(.tiny-tree-menu .tiny-tree) {
    height: 100%;
    overflow: auto;
  }

  .theme-box {
    position: fixed;
    top: 88%;
    right: 30px;
    z-index: 99;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    background-color: #fff;
    border-radius: 100%;
    cursor: pointer;

    img {
      display: block;
      width: inherit;
      height: inherit;
    }
  }
</style>
