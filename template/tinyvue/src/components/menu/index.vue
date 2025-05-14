<template>
  <div class="menu-router">
    <tiny-tree-menu
      ref="tree"
      :data="MenuData"
      :show-filter="false"
      node-key="id"

      :default-expanded-keys="expandeArr"
      only-check-children
      check-strictly
      menu-collapsible
      @current-change="currentChange"
      @collapse-change="collapseChange"
      class="h-[calc(100vh-60px)]"
    >
      <template #default="slotScope">
        <template v-for="(item, index) in routerTitle" :key="index">
          <span v-if="slotScope.label === item.label" class="menu-title">
            <component :is="item.customIcon"></component>
            <span>{{ $t(item.locale) }}</span>
          </span>
        </template>
      </template>
    </tiny-tree-menu>
  </div>
</template>

<script lang="ts" setup>
  import { ref, onMounted, watch, computed, unref, h } from 'vue';
  import { TreeMenu as tinyTreeMenu } from '@opentiny/vue';
  import { useMenuStore } from '@/store/modules/router';
  import router from '@/router';
  import { ITreeNodeData } from '@/router/guard/menu';
  import * as icons from '@opentiny/vue-icon';
  import { useTabStore, useAppStore } from '@/store';
  import { useDeepClone } from '@/hooks/useDeepClone';

  const menuStore = useMenuStore();
  await menuStore.getMenuList();
  const rawMenuData = computed(() => useDeepClone(unref(menuStore.menuList)));
  type SideMenuData = (ITreeNodeData & { meta: { url: string } })[];

  let routerTitle = [] as any;
  const appStore = useAppStore();

  const filtter = (treeNodeDatas: ITreeNodeData[]) => {
    const menus: SideMenuData = [];
    for (let i = 0; i < treeNodeDatas.length; i += 1) {
      const treeNodeData = treeNodeDatas[i];
      const url = treeNodeData.url!;
      delete treeNodeData.url;
      const temp = {} as any;
      temp.label = treeNodeData.label;
      temp.locale = treeNodeData.locale;
      if (treeNodeData.customIcon) {
        try {
          temp.customIcon = icons[treeNodeData.customIcon]();
        } catch (error) {
          temp.customIcon = h('i', { class: `ci-${treeNodeData.customIcon} .tiny-svg `, style: { marginRight:  'var(--tv-TreeMenu-prefix-icon-margin-right)' } });
        }
      }
      routerTitle.push(temp);
      menus.push({
        ...treeNodeData,
        meta: {
          url,
        },
        children: [...filtter(treeNodeData.children ?? [])],
      });
    }
    return menus;
  };

  const MenuData = computed(() => {
    if (routerTitle.length) {
      routerTitle = [];
    }
    return filtter(rawMenuData.value);
  });

  const currentChange = (data: any, node) => {
    if (!node.isLeaf) {
      return;
    }
    router.replace({ name: data.label });
  };

  const collapseChange = (value) => {
    appStore.isMenuCollapsed = value
  }

  const findId = (name: string, path: string) => {
    const dfs = (item, url: string[]) => {
      if (url.join('/') === path) {
        return item.id;
      }
      const len = item.children.length ?? 0;
      for (let i = 0; i < len; i += 1) {
        if (item.children?.[i]) {
          const id = dfs(
            item.children[i],
            [...url, item.children[i].meta.url].filter((p) => p.length),
          );
          if (id !== undefined) {
            return id;
          }
        }
      }
      return undefined;
    };
    for (let i = 0; i < MenuData.value.length; i += 1) {
      const menu = MenuData.value[i];
      const data = dfs(menu, [
        import.meta.env.VITE_CONTEXT.replace(/\/$/, ''),
        menu.meta.url.replace(/\/$/, ''),
      ]);
      if (data !== undefined) {
        return data;
      }
    }
    return -1;
  };
  const tree = ref();
  const expandeArr = ref<(string | number)[]>([]);
  const tabStore = useTabStore();
  onMounted(() => {
    watch(
      () => tabStore.current,
      () => {
        if (!tabStore.current) {
          return;
        }
        const key = findId(tabStore.current.name, tabStore.current.link);
        tree.value.setCurrentKey(key);
        const { parentId = null } = tree.value.getCurrentNode();
        if (parentId && !expandeArr.value.includes(parentId)) {
          expandeArr.value = expandeArr.value.concat(parentId);
        }
      },
      { deep: true, immediate: true },
    );
  });
</script>

<style scoped></style>
