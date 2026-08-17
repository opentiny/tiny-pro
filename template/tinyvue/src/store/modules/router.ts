import { defineStore } from 'pinia';
import { getRoleMenu } from '@/api/menu';
import useUserStore from './user';

export const useMenuStore = defineStore('menu', {
  state() {
    return {
      menuList: [] as any[],
      flatMenuList: [] as any[],
    };
  },
  actions: {
    async getMenuList() {
      const userStore = useUserStore();
      if (!userStore.email) {
        return [];
      }
      const { data } = await getRoleMenu(userStore.email);
      this.menuList = data;
      this.menuListFlat();
      return data;
    },
    menuListFlat() {
      this.flatMenuList = [];
      const dfs = (item: any) => {
        this.flatMenuList.push(item);
        const children = item.children ?? [];
        for (let i = 0; i < children.length; i += 1) {
          dfs(children[i]);
        }
      };
      for (let i = 0; i < this.menuList.length; i += 1) {
        dfs(this.menuList[i]);
      }
    },
  },
});
