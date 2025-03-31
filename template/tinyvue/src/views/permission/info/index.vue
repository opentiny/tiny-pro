<script lang="ts" setup>
  import GeneralLayout from '@/layout/general-layout.vue';
  import infoTab from './components/info-tab.vue';
</script>

<template>
  <general-layout :breadcrumb="['menu.systemManager', 'menu.permission.info']">
    <info-tab />
  </general-layout>
</template>
