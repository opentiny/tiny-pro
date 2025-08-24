<template>
  <tiny-grid
    ref="grid"
    :pager="pagerConfig"
    :fetch-data="fetchData"
    :edit-config="
      rolePermission.includes('i18n::update')
        ? { trigger: 'click', mode: 'cell', showStatus: true }
        : undefined
    "
    :loading="loading"
    remote-filter
    refresh
    :size="gridSize"
    align="center"
    @edit-closed="onEditClosed"
  >
    <tiny-grid-column type="selection" width="30px"></tiny-grid-column>
    <tiny-grid-column field="id" title="ID"></tiny-grid-column>
    <tiny-grid-column
      field="key"
      title="key"
      :editor="{ component: 'input', autoselect: true }"
      :filter="keyFilter"
    ></tiny-grid-column>
    <tiny-grid-column
      field="content"
      title="content"
      :editor="{ component: 'input' }"
      :filter="contentFilter"
    ></tiny-grid-column>
    <tiny-grid-column
      field="lang"
      title="lang"
      :editor="{ component: 'select', options }"
      :format-config="{ async: true, data: options, type: 'enum' }"
      :filter="langFilter"
    ></tiny-grid-column>
    <tiny-grid-column :title="$t('searchTable.columns.operations')" width="14%">
      <template #default="data">
        <tiny-popconfirm
          title="确定要删除此词条吗？"
          type="info"
          trigger="click"
          @confirm="removeLocale(data.row)"
        >
          <template #reference>
            <tiny-button
              v-permission="'i18n::remove'"
              type="text"
            >
              <IconDel class="operation-icon"></IconDel>
              {{ $t('locale.remove') }}
            </tiny-button>
          </template>
        </tiny-popconfirm>
      </template>
    </tiny-grid-column>
  </tiny-grid>
</template>

<script lang="ts" setup>
  import { useI18n } from 'vue-i18n';
  import { computed, ref } from 'vue';
  import { getAllLocalItems, patchLocal, deleteLocale, batchDeleteLocal } from '@/api/local';
  import useLoading from '@/hooks/loading';
  import { useUserStore } from '@/store';
  import { useLocales } from '@/store/modules/locales';
  import { FilterType, InputFilterValue } from '@/types/global';
  import {
    Notify,
    Grid as TinyGrid,
    GridColumn as TinyGridColumn,
    Button as TinyButton,
    Popconfirm as TinyPopconfirm,
    TinyModal,
  } from '@opentiny/vue';
  import { iconDel } from '@opentiny/vue-icon';
  import { useResponsiveGrid } from '@/hooks/responsive'

  const { gridSize } = useResponsiveGrid()

  const IconDel = iconDel();
  const { t } = useI18n();
  const grid = ref();
  const localeStore = useLocales();

  export type LocalTableData = {
    id: number;
    key: string;
    content: string;
    lang: string;
  };
  const userStore = useUserStore();
  const rolePermission = computed(() => userStore.rolePermission);

  const keyFilter = {
    inputFilter: true,
  };
  const contentFilter = {
    inputFilter: true,
  };
  const langFilter = {
    enumable: true,
    multi: true,
    values: () => {
      return Promise.resolve(
        localeStore.lang.map((language) => ({
          label: language.name,
          value: language.id,
        })),
      );
    },
  };
  const pagerConfig = ref({
    attrs: {
      currentPage: 1,
      pageSize: 10,
      pageSizes: [10, 20, 50, 100],
      total: 0,
      align: 'right',
      layout: 'sizes, total, prev, pager, next, jumper',
    },
  });

  const options = computed(() =>
    localeStore.lang.map((language) => ({
      label: language.name,
      value: language.name,
    })),
  );
  const { loading, setLoading } = useLoading();
  if (!localeStore.lang.length) {
    localeStore.fetchLang();
  }

  let currentPage = 0;

  const filterInputValue2String = (value: InputFilterValue) => {
    let str = '';
    if (value.relation === 'contains') {
      str += '%';
    }
    str += value.text;
    if (value.relation === 'startwith' || value.relation === 'contains') {
      str += '%';
    }
    return str;
  };

  const getData = ({
    page,
    filters,
  }: {
    page: { pageSize: number; currentPage: number };
    filters: FilterType;
  }) => {
    const key = filters.key
      ? filterInputValue2String(filters.key.value as InputFilterValue)
      : undefined;
    const content = filters.content
      ? filterInputValue2String(filters.content.value as InputFilterValue)
      : undefined;
    const lang =
      filters.lang && (filters.lang.value as number[]).length
        ? (filters.lang.value as number[]).toString()
        : undefined;
    const { pageSize } = page;
    currentPage = page.currentPage;
    setLoading(true);
    return new Promise((resolve) => {
      getAllLocalItems(currentPage, pageSize, 0, { key, content, lang })
        .then(({ data }) => {
          resolve({
            result: data.items.map((item) => {
              return {
                id: item.id,
                key: item.key,
                content: item.content,
                lang: item.lang.name,
              };
            }),
            page: {
              total: data.meta.totalItems,
            },
          });
        })
        .finally(() => {
          setLoading(false);
        });
    });
  };
  const onEditClosed = ({ row }: { row: Record<string, any> }) => {
    if (grid.value.hasRowChange(row)) {
      const langId = localeStore.lang.filter(
        (lang) => lang.name === row.lang,
      )[0].id;
      patchLocal(row.id, {
        content: row.content,
        key: row.key,
        lang: langId,
      })
        .then(() => {
          Notify({
            type: 'info',
            message: '更新成功',
          });
        })
        .catch((error) => {
          grid.value.revertData(row);
          if (error.response && error.response.data) {
            const errorMessage = error.response.data.message || '未知错误';
            TinyModal.message({
              message: errorMessage,
              status: 'error',
            });
          }
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };
  const batchRemoveLocale = () => {
    const rowIds = grid.value.getAllSelection().flatMap((row) => row.id);
    if(rowIds.length === 0) {
      TinyModal.message({
        message: '请选择要删除的词条',
        status: 'error',
      });
      return;
    }
    TinyModal.confirm({
      title: '删除确认',
      message: '确定要批量删除选中的用户吗？',
      onConfirm: () => {
        setLoading(true);
        batchDeleteLocal(rowIds)
          .then(() => {
            TinyModal.message({
              message: '批量删除成功',
              status: 'success',
            });
            grid.value.handleFetch(); 
          })
          .catch((error) => {
            if (error.response && error.response.data) {
              const errorMessage = error.response.data.message || '未知错误';
              TinyModal.message({
                message: errorMessage,
                status: 'error',
              });
            }
          })
          .finally(() => {
            setLoading(false);
          });
      }})
    
    
  }

  const removeLocale = (row: any) => {
    setLoading(true);
    deleteLocale(row.id)
      .then(() => {
        localeStore.$patch({
          locales: localeStore.locales.filter((locale) => locale.id !== row.id),
        });
        grid.value.remove(row);
      })
      .catch((error) => {
        if (error.response && error.response.data) {
          const errorMessage = error.response.data.message || '未知错误';
          TinyModal.message({
            message: errorMessage,
            status: 'error',
          });
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const fetchData = ref({
    api: getData,
    filter: true,
  });
  defineExpose({
    reload: () => {
      grid.value.handleFetch();
    },
    batchRemoveLocale
  });
</script>

<style scoped lang="less">
.operation-icon {
  margin-right: 3px;
  fill: currentColor;
}
</style>
