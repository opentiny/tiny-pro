import type { Router } from 'vue-router'
import { useTabStore } from '@/store'

export function setupTabsGuard(router: Router) {
  router.beforeEach((to, from, next) => {
    const tabStore = useTabStore()
    if (tabStore.has(to.meta.locale ?? '')) {
      tabStore.set(to.meta.locale!)
      next()
      return
    }
    tabStore.add({ name: to.meta.locale!, link: to.fullPath })
    tabStore.set(to.meta.locale!)
    next()
  })
}
