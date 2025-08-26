<script lang="ts" setup>
  import {
    Grid as TinyGrid,
    GridColumn as TinyGridColumn,
    GridToolbar as TinyGridToolbar,
    Button as TinyButton,
    Pager as TinyPager,
    Modal as tinyModal,
  } from '@opentiny/vue';
  import useLoading from '@/hooks/loading';
  import generalLayout from '@/layout/general-layout.vue';
  import { ApigInfo } from '@/types/global';
  import { HwcClientService } from '@/utils/hwcClient.service';
  import { sortTime } from '@/utils/time';
  import { reactive, ref } from 'vue';
  import { useResponsiveGrid } from '@/hooks/responsive'
  import edit from './components/edit/index.vue';
  import create from './components/create/index.vue';
  import deletes from './components/delete/index.vue';

  const { gridSize } = useResponsiveGrid()

  const contractApigInfo: ApigInfo = {
    apigName: 'apig_contract',
    apigGroupName: 'group_contract',
  };
  const { loading, setLoading } = useLoading();
  const tableData = ref<any[]>();
  const display = ref(false);
  const title = ref();
  const choose = ref('');
  const init = ref();
  const taskGrid = ref();
  const table = ref();
  const content = ref();
  const modalHeight = ref('536');
  const update = ref(true);

  const fetchData = async (params: {
    pageIndex: number;
    pageSize: number;
    query: string;
    field: string;
  }) => {
    setLoading(true);
    try {
      const val = await getContractsData(params);
      tableData.value = val;
      let offset = (params.pageIndex - 1) * params.pageSize;
      const data = tableData.value.sort(sortTime('updateAt'));
      return {
        result: data.slice(offset, offset + params.pageSize),
        page: {
          total: tableData.value.length,
        },
      };
    } finally {
      setLoading(false);
    }
  };

  const getContractsData = async (params: { query: string; field: string }) => {
    try {
      const val = await HwcClientService.apiRequest(
        'getContracts',
        params,
        contractApigInfo,
      );
      return val.data;
    } catch {
      return [];
    }
  };

  const disTheme = (item: string, data: any) => {
    init.value = data;
    choose.value = item;
    display.value = !display.value;
    if (item === 'edit') {
      title.value = edit;
      modalHeight.value = '536';
    } else if (item === 'deletes') {
      title.value = deletes;
      modalHeight.value = '369';
    } else {
      title.value = create;
      modalHeight.value = '536';
    }
  };
  const pagerConfig = reactive({
    component: TinyPager,
    attrs: {
      currentPage: 1,
      pageSize: 10,
      pageSizes: [10, 20],
      total: 10,
      layout: 'total, prev, pager, next, jumper, sizes',
    },
  });
  async function delContracts(params: { id: string }) {
    return HwcClientService.apiRequest('delContract', params, contractApigInfo);
  }

  // 编辑合同
  async function editContracts(params: {
    id: string;
    name: string;
    customer: string;
    description: string;
  }) {
    return HwcClientService.apiRequest(
      'editContract',
      params,
      contractApigInfo,
    );
  }

  // 创建合同
  async function createContracts(params: {
    name: string;
    customer: string;
    description: string;
  }) {
    return HwcClientService.apiRequest('addContract', params, contractApigInfo);
  }
  async function confirmClick() {
    display.value = false;
    update.value = false;
    if (choose.value === 'edit') {
      const data = content.value.resultData();
      const params = {
        id: init.value.id,
        name: data.name,
        customer: data.customer,
        description: data.description,
      };
      await editContracts(params);
      fetchData({
        pageIndex: 1,
        pageSize: 10,
        query: '',
        field: 'name',
      });
    }
    if (choose.value === 'deletes') {
      const params = {
        id: init.value.id,
      };
      await delContracts(params);
      fetchData({
        pageIndex: 1,
        pageSize: 10,
        query: '',
        field: 'name',
      });
    }
    if (choose.value === 'create') {
      const data = content.value.resultData();
      const params = {
        name: data.name,
        customer: data.customer,
        description: data.description,
      };
      await createContracts(params);
      fetchData({
        pageIndex: 1,
        pageSize: 10,
        query: '',
        field: 'name',
      });
    }
  }

  const closeClick = () => {
    display.value = false;
  };
  const fetchDataOption = reactive({
    api: ({ page }: any) => {
      const { currentPage, pageSize } = page;
      const data = fetchData({
        pageIndex: currentPage,
        pageSize,
        query: '',
        field: 'name',
      });
      return data;
    },
  });
</script>

<template>
  <general-layout :breadcrumb="['menu.cloud', 'menu.cloud.contracts']">
    <tiny-grid
      :ref="taskGrid"
      :fetch-data="fetchDataOption"
      :auto-load="true"
      :pager="pagerConfig"
      :loading="loading"
      :size="gridSize"
      :auto-resize="true"
      align="center"
    >
      <template #toolbar>
        <tiny-grid-toolbar>
          <template #buttons="slotScope">
            <div class="btn">
              <tiny-button
                type="primary"
                @click="disTheme('create', slotScope.row)"
                >{{ $t('menu.cloud.create') }}</tiny-button
              >
            </div>
          </template>
        </tiny-grid-toolbar>
      </template>
      <tiny-grid-column type="index" width="40"></tiny-grid-column>
      <tiny-grid-column
        field="name"
        :title="$t('menu.cloud.name')"
        align="center"
        sortable
      ></tiny-grid-column>
      <tiny-grid-column
        field="id"
        :title="$t('menu.cloud.id')"
        align="center"
      ></tiny-grid-column>
      <tiny-grid-column
        field="customer"
        :title="$t('menu.cloud.customer')"
        align="center"
      ></tiny-grid-column>
      <tiny-grid-column
        field="description"
        :title="$t('menu.cloud.description')"
        align="center"
      ></tiny-grid-column>
      <tiny-grid-column
        field="updatedAt"
        :title="$t('menu.cloud.updatedAt')"
        align="center"
        sortable
      ></tiny-grid-column>
      <tiny-grid-column
        :title="$t('searchTable.columns.operations')"
        align="center"
      >
        <template #default="slotScope">
          <span class="operation">
            <a @click="disTheme('edit', slotScope.row)">
              {{ $t('menu.cloud.editOpa') }}
            </a>
            &nbsp;
            <a @click="disTheme('deletes', slotScope.row)">
              {{ $t('menu.cloud.editDel') }}
            </a>
          </span>
        </template>
      </tiny-grid-column>
    </tiny-grid>
    <div v-if="display">
      <tiny-modal
        v-model="display"
        :lock-scroll="false"
        :show-header="false"
        :show-footer="false"
        type="confirm"
        mask-closable="true"
        :height="modalHeight"
        width="589"
        @confirm="confirmClick"
        @close="closeClick"
      >
        <template #default>
          <component
            :is="title"
            ref="content"
            :init="init"
            @myclick="confirmClick"
            @mycancel="closeClick"
          ></component>
        </template>
      </tiny-modal>
    </div>
  </general-layout>
</template>

<style scoped lang="less">
  :deep(.tiny-grid-button__wrapper) {
    width: 100%;
  }

  :deep(.tiny-pager) {
    float: right;
  }

  :deep(.tiny-modal__box) {
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 0 30px 15px rgba(37, 43, 58, 0.3);
  }

  .btn {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: space-around;

    button {
      display: block;
      border-radius: 4px;
    }
  }

  .operation {
    color: #526ecc;
  }

  .content :deep(.tiny-grid) {
    height: inherit;
  }
</style>
