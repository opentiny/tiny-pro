<template>
  <general-layout :breadcrumb="['menu.systemManager', 'menu.role.info']">
    <info-tab />
  </general-layout>
</template>

<script lang="ts" setup>
  import GeneralLayout from '@/layout/general-layout.vue';
  import infoTab from './components/info-tab.vue';
</script>
