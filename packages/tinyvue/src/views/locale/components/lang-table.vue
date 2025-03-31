<template>
  <tiny-grid ref="grid" :loading="loading" :data="lang">
    <tiny-grid-column title="id" field="id" />
    <tiny-grid-column title="name" field="name" />
    <tiny-grid-column>
      <template #default="data">
        <tiny-button
          v-permission="'lang::remove'"
          @click="removeLang(data.row)"
        >
          {{ $t('lang.manage.remove') }}
        </tiny-button>
      </template>
    </tiny-grid-column>
  </tiny-grid>
</template>

<script lang="ts" setup>
  import {
    Grid as TinyGrid,
    GridColumn as TinyGridColumn,
    Button as TinyButton,
    Modal,
  } from '@opentiny/vue';
  import { useLocales } from '@/store/modules/locales';
  import { computed, ref } from 'vue';
  import useLoading from '@/hooks/loading';
  import { deleteLang } from '@/api/lang';

  const localeStore = useLocales();
  const lang = computed(() => localeStore.lang);
  const { loading, setLoading } = useLoading();
  const grid = ref();
  if (!localeStore.lang.length) {
    setLoading(true);
    localeStore.fetchLang().finally(() => {
      setLoading(false);
    });
  }
  const removeLang = (row: any) => {
    setLoading(true);
    deleteLang(row.id)
      .then(() => {
        localeStore.$patch({
          lang: lang.value.filter((language) => language.id !== row.id),
        });
        return grid.value.remove(row);
      })
      .catch((reason) => {
        Modal.message({
          status: 'error',
          message: reason.response.data.message,
        });
        grid.value.revertData(row);
      })
      .finally(() => {
        setLoading(false);
      });
  };
</script>
