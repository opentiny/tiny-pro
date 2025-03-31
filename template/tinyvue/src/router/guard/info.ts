import { getUserInfo } from '@/api/user';
import { _i18 } from '@/locale';
import { useUserStore } from '@/store';
import { useLocales } from '@/store/modules/locales';
import { Role } from '@/store/modules/user/types';
import { isLogin, setToken } from '@/utils/auth';
import NProgress from 'nprogress';
import { getCurrentInstance } from 'vue';
import { useI18n } from 'vue-i18n';
import { LocationQueryRaw, Router } from 'vue-router';

export default function setupInfoGuard(router: Router) {
  router.beforeEach(async (to, from, next) => {
    NProgress.start();
    if (to.name === 'login') {
      next();
      NProgress.done();
      return;
    }
    const userStore = useUserStore();
    const localesStore = useLocales();
    const { data } = (await getUserInfo()) ?? { data: null };
    if (!data) {
      next({
        name: 'login',
        query: {
          redirect: to.name,
          ...to.query,
        } as LocationQueryRaw,
      });
      setToken('');
      NProgress.done();
      return;
    }
    if (localesStore.shouldFetch) {
      await localesStore.fetchLang();
      await localesStore.fetchLocalTable();
    }
    if (localesStore.shouldMerge) {
      const entries = Object.entries(localesStore.localTable);
      for (let i = 0; i < entries.length; i += 1) {
        const lang = entries[i][0];
        const value = entries[i][1];
        _i18?.global.mergeLocaleMessage(lang, value);
      }
    }
    localesStore.$patch({
      shouldFetch: false,
      shouldMerge: false,
    });

    userStore.setInfo(data);
    userStore.setInfo({
      role: data.role[0].name,
      job: data.role[0].name,
      roleId: data.role[0].id,
    });
    userStore.rolePermission = (data.role as unknown as Role[])
      .flatMap((role) => role.permission)
      .map((permission) => permission.name);
    next();
    NProgress.done();
  });
}
