/* eslint-disable prefer-template */

import DefaultLayout from '@/layout/default-layout.vue';
import { RouteRecordRaw } from 'vue-router';

export default [
  {
    path: '/',
    redirect: `${import.meta.env.VITE_CONTEXT}login`,
  },
  {
    path: import.meta.env.VITE_CONTEXT,
    redirect: { path: `${import.meta.env.VITE_CONTEXT}login` },
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
    component: () => import('@/views/Preview/index.vue'),
  },
  {
    name: 'redirect',
    path: import.meta.env.VITE_CONTEXT + 'redirect',
    component: () => import('@/views/redirect.vue'),
  },
] as RouteRecordRaw[];
