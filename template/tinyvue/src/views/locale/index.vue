<template>
  <general-layout :breadcrumb="['menu.systemManager', 'menu.i18n']">
    <add-locale
      v-permission="'i18n::add'"
      class="locale-add-btn"
      @lang-change="onChange"
      @local-change="onChange"
      @batch-remove="onRemove"
    />
    <locale-table ref="localTable" />
  </general-layout>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import GeneralLayout from '@/layout/general-layout.vue';
  import addLocale from './components/add-locale.vue';
  import localeTable from './components/locale-table.vue';

  const localTable = ref();
  const onChange = () => {
    localTable.value.reload();
  };
  const onRemove = () => {
    localTable.value.batchRemoveLocale();
  }
</script>

<style scoped lang="less">
  .locale-add-btn {
    padding: 10px 0 24px 10px;
  }
</style>
