import type { Router, LocationQueryRaw } from 'vue-router';
import NProgress from 'nprogress'; // progress bar
import { isLogin } from '@/utils/auth';
import { Modal } from '@opentiny/vue';
import { nextTick } from 'vue';
import { t } from '@opentiny/vue-locale';

export default function setupPermissionGuard(router: Router) {
  router.beforeEach(async (to, from, next) => {
    NProgress.start();
    if (!isLogin()) {
      if (to.name === 'login') {
        next();
        NProgress.done();
        return;
      }
      await nextTick();
      Modal.message({
        message: t('http.error.TokenExpire'),
        status: 'error',
      });
      await nextTick();
      next({
        name: 'login',
        query: {
          redirect: to.name,
          ...to.query,
        } as LocationQueryRaw,
      });
      NProgress.done();
    } else {
      next();
      NProgress.done();
    }
  });
}
