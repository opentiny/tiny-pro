<template>
  <div class="search-container-list">
    <Breadcrumb :items="['menu.list.searchTable']" />

    <div class="search-table-container">
      <tiny-fullscreen
        :teleport="true"
        :page-only="true"
        :z-index="999"
        :fullscreen="fullscreen"
        @update:fullscreen="fullscreen = $event"
      >
        <div class="tiny-fullscreen-scroll">
          <div class="tiny-fullscreen-wrapper">
            <div class="btn">
              <transition-fade-down-group>
                <tiny-button @click="toCsvEvent">
                  {{ $t('searchTable.operation.import') }}
                </tiny-button>
                <div class="search-box-container">
                  <tiny-search-box
                    v-model="tags"
                    :items="items"
                    :empty-placeholder="$t('searchTable.form.placeholder')"
                    @change="reloadGrid"
                  ></tiny-search-box>
                </div>
                <div class="screen" @click="toggle">
                  <img
                    v-if="!fullscreen"
                    src="@/assets/images/screen-out.png"
                    class="screen-image"
                  />
                  <img
                    v-if="fullscreen"
                    src="@/assets/images/screen-in.png"
                    class="screen-image"
                  />
                  <span>
                    {{
                      fullscreen
                        ? $t('searchTable.collapse.restores')
                        : $t('searchTable.collapse.full')
                    }}
                  </span>
                </div>
              </transition-fade-down-group>
            </div>
            <tiny-grid
              ref="taskGrid"
              :fetch-data="fetchDataOption"
              :pager="pagerConfig"
              :loading="loading"
              size="medium"
              :height="fullscreen ? 820 : 600"
              :auto-resize="true"
            >
              <tiny-grid-column type="selection" width="60"></tiny-grid-column>
              <tiny-grid-column
                field="name"
                :title="$t('searchTable.columns.name')"
                align="center"
              ></tiny-grid-column>
              <tiny-grid-column
                field="employeeNo"
                :title="$t('searchTable.columns.number')"
                align="center"
              ></tiny-grid-column>
              <tiny-grid-column
                field="departmentLevel"
                :title="$t('searchTable.columns.filterType')"
                align="center"
              ></tiny-grid-column>
              <tiny-grid-column
                field="department"
                :title="$t('searchTable.columns.department')"
                align="center"
              ></tiny-grid-column>
              <tiny-grid-column
                field="status"
                :title="$t('searchTable.form.status')"
                align="center"
              >
                <template #default="{ row }">
                  <span
                    class="status"
                    :class="{
                      'status-closed': row.status === '0',
                      'status-finished': row.status === '1',
                    }"
                  >
                    <span class="status-dot"></span>
                    <span class="status-text">
                      {{ getStatusText(row.status) }}
                    </span>
                  </span>
                </template>
              </tiny-grid-column>
              <tiny-grid-column
                field="workbenchName"
                :title="$t('searchTable.columns.workname')"
                align="center"
              ></tiny-grid-column>
              <tiny-grid-column
                field="project"
                :title="$t('searchTable.columns.enablement')"
                align="center"
              ></tiny-grid-column>
              <tiny-grid-column
                field="type"
                :title="$t('searchTable.columns.type')"
                align="center"
              ></tiny-grid-column>
              <tiny-grid-column
                field="address"
                :title="$t('searchTable.columns.study')"
                align="center"
              ></tiny-grid-column>
              <tiny-grid-column
                field="roles"
                :title="$t('searchTable.columns.role')"
                align="center"
              ></tiny-grid-column>
              <tiny-grid-column
                field="lastUpdateUser"
                :title="$t('searchTable.columns.updatesperson')"
                align="center"
              ></tiny-grid-column>
              <tiny-grid-column
                field="createTime"
                :title="$t('searchTable.columns.createdTime')"
                align="center"
              ></tiny-grid-column>
              <tiny-grid-column
                :title="$t('searchTable.columns.operations')"
                align="center"
              >
                <template #default="data">
                  <a class="operation" @click="handleDelete(data.row.id)">
                    {{ $t('searchTable.columns.operations.delete') }}
                  </a>
                </template>
              </tiny-grid-column>
            </tiny-grid>
          </div>
        </div>
      </tiny-fullscreen>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref, reactive, toRefs } from 'vue';
  import {
    Grid as TinyGrid,
    GridColumn as TinyGridColumn,
    GridToolbar as TinyGridToolbar,
    Form as TinyForm,
    FormItem as TinyFormItem,
    Input as TinyInput,
    Button as TinyButton,
    Row as TinyRow,
    Col as TinyCol,
    Select as TinySelect,
    Pager as TinyPager,
    Fullscreen as TinyFullscreen,
    Modal,
  } from '@opentiny/vue';
  import TinySearchBox from '@opentiny/vue-search-box';
  import {
    queryEmployeeList,
    deleteEmployee,
    QueryTaskParmas,
  } from '@/api/list';
  import { t } from '@opentiny/vue-locale';
  import TransitionFadeSlideGroup from '@/components/transition/transition-fade-slide-group.vue';

  // 初始化请求数据
  interface FilterOptions {
    id: string;
    department: string;
    roles: string;
    dateRange: Array<string | Date>;
    name: string;
    status: string;
    workbenchName: string;
    project: string;
    type: string;
    address: string;
  }
  const tags = ref([]);

  // 搜索配置
  const items = [
    {
      label: t('searchTable.columns.name'),
      field: 'name',
    },
    {
      label: t('searchTable.columns.department'),
      field: 'department',
    },
    {
      label: t('searchTable.columns.role'),
      field: 'roles',
    },
    {
      label: t('searchTable.columns.workname'),
      field: 'workbenchName',
    },
    {
      label: t('searchTable.columns.enablement'),
      field: 'project',
    },
    {
      label: t('searchTable.columns.type'),
      field: 'type',
    },
    {
      label: t('searchTable.columns.study'),
      field: 'address',
    },
    {
      label: t('searchTable.form.status'),
      field: 'status',
      replace: true,
      options: [
        {
          id: '0',
          label: 'offline',
        },
        {
          id: '1',
          label: 'online',
        },
        {
          id: '2',
          label: 'doing',
        },
      ],
    },
  ];
  // 加载效果
  const state = reactive<{
    loading: boolean;
    filterOptions: FilterOptions;
  }>({
    loading: false,
    filterOptions: {} as FilterOptions,
  });

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

  let tableData = ref([]);
  const taskGrid = ref();
  const { loading, filterOptions } = toRefs(state);

  const statusOptions = [
    {
      value: '0',
      label: 'offline',
    },
    {
      value: '1',
      label: 'online',
    },
    {
      value: '2',
      label: 'doing',
    },
  ];

  // 请求数据接口方法
  async function fetchData(
    params: QueryTaskParmas = {
      pageIndex: 1,
      pageSize: 10,
      status: '',
    },
  ) {
    let searchInfo = {};
    if (filterOptions.value?.length) {
      filterOptions.value.forEach((item) => {
        searchInfo[item.field] = item.value;
      });
    }

    const queryParmas = {
      searchInfo,
      ...params,
    };

    state.loading = true;
    try {
      const { data } = await queryEmployeeList(queryParmas);
      const { data: list, total } = data;
      tableData.value = list;
      return {
        result: list,
        page: { total },
      };
    } finally {
      state.loading = false;
    }
  }

  const fetchDataOption = reactive({
    api: ({ page }: any) => {
      const { currentPage, pageSize } = page;

      return fetchData({
        pageIndex: currentPage,
        pageSize,
      });
    },
  });
  const handleDelete = (id: string) => {
    deleteEmployee(id).then((res) => {
      Modal.message({
        message: '已删除',
        status: 'success',
      });
    });
  };
  function getStatusText(status: string) {
    return statusOptions.find(({ value }) => status === value)?.label || '';
  }

  // form的button
  function reloadGrid(filters) {
    filterOptions.value = filters;
    taskGrid?.value.handleFetch('reload');
  }

  // 导出
  const toCsvEvent = () => {
    taskGrid.value.exportCsv({
      filename: 'table.csv',
      original: true,
      isHeader: false,
      data: tableData.value,
    });
  };

  // 全屏缩放设置
  const fullscreen = ref(false);
  const toggle = () => {
    fullscreen.value = !fullscreen.value;
  };
</script>

<style scoped lang="less">
  @import './search-table.less';
</style>
