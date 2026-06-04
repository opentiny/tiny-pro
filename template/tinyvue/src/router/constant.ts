/* eslint-disable prefer-template */

import type { RouteRecordRaw } from 'vue-router'
import DefaultLayout from '@/layout/default-layout.vue'
import { isLogin } from '@/utils/auth'

const loginPath = `${import.meta.env.VITE_CONTEXT}login`

export default [
  {
    path: '/',
    redirect: () => (isLogin() ? { name: 'root' } : loginPath),
  },
  {
    path: import.meta.env.VITE_CONTEXT,
    redirect: () => (isLogin() ? { name: 'root' } : { path: loginPath }),
  },
  {
    path: import.meta.env.VITE_CONTEXT + 'login',
    name: 'login',
    component: () => import('@/views/login/index.vue'),
    meta: {
      requiresAuth: false,
    },
  },
  {
    name: 'root',
    path: import.meta.env.VITE_CONTEXT,
    component: DefaultLayout,
    children: [],
  },
  {
    path: import.meta.env.VITE_CONTEXT + 'preview',
    name: 'preview',
    component: () => import('@/views/preview/index.vue'),
  },
  {
    name: 'redirect',
    path: import.meta.env.VITE_CONTEXT + 'redirect',
    component: () => import('@/views/redirect.vue'),
  },
] as RouteRecordRaw[]
