<template>
  <div class="search-container-list">
    <Breadcrumb :items="['menu.list', 'menu.list.searchTable']" />

    <div class="search-table-container">
      <div class="button-group">
        <tiny-button>{{ $t('userInfo.table.operations.delete') }}</tiny-button>
        <tiny-file-upload action="#" accept=".xls,.xlsx" @change="importExcel">
          <tiny-button >{{ $t('userInfo.table.import') }}</tiny-button>
        </tiny-file-upload>
        <tiny-button @click="toCsvEvent">{{ $t('userInfo.table.export') }}</tiny-button>
      </div>
      <div class="tiny-fullscreen-scroll">
        <div class="tiny-fullscreen-wrapper">
          <div class="btn">
            <transition-fade-down-group>
              <div class="search-box-container">
                <tiny-search-box
                  v-model="tags"
                  :items="items"
                  :empty-placeholder="$t('searchTable.form.placeholder')"
                  @change="reloadGrid"
                ></tiny-search-box>
              </div>
              <div class="button-group">
                <tiny-button :icon="IconRefresh" @click="handleRefresh"> </tiny-button>
                <tiny-button :icon="IconSetting"> </tiny-button>
              </div>
            </transition-fade-down-group>
          </div>
          <tiny-grid
            ref="taskGrid"
            :fetch-data="fetchDataOption"
            :pager="pagerConfig"
            :loading="loading"
            size="medium"
            :height="640"
            :auto-resize="true"
          >
            <tiny-grid-column type="selection" width="60"></tiny-grid-column>
            <tiny-grid-column
              field="name"
              :title="$t('searchTable.columns.name')"
            ></tiny-grid-column>
            <tiny-grid-column
              field="employeeNo"
              :title="$t('searchTable.columns.employeeNo')"
              sortable
            ></tiny-grid-column>
            <tiny-grid-column
              field="departmentLevel"
              :title="$t('searchTable.columns.departmentLevel')"
            ></tiny-grid-column>
            <tiny-grid-column
              field="department"
              :title="$t('searchTable.columns.department')"
            ></tiny-grid-column>
            <tiny-grid-column
              field="status"
              :title="$t('searchTable.form.status')"
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
              :title="$t('searchTable.columns.workbenchName')"
            ></tiny-grid-column>
            <tiny-grid-column
              field="project"
              :title="$t('searchTable.columns.project')"
            ></tiny-grid-column>
            <tiny-grid-column
              field="type"
              :title="$t('searchTable.columns.type')"
            ></tiny-grid-column>
            <tiny-grid-column
              field="address"
              :title="$t('searchTable.columns.address')"
            ></tiny-grid-column>
            <tiny-grid-column
              field="roles"
              :title="$t('searchTable.columns.roles')"
            ></tiny-grid-column>
            <tiny-grid-column
              field="lastUpdateUser"
              :title="$t('searchTable.columns.lastUpdateUser')"
            ></tiny-grid-column>
            <tiny-grid-column
              field="createTime"
              :title="$t('searchTable.columns.createTime')"
            ></tiny-grid-column>
            <tiny-grid-column
              :title="$t('searchTable.columns.operations')"
            >
              <template #default="data">
                <a
                  class="operation"
                  @click="handleUpdated(data.row.id)"
                >
                  <IconEditor class="operation-icon"></IconEditor>{{ $t('userInfo.table.operations.update') }}
                </a>
                <tiny-popconfirm
                  title="确定要删除此用户吗？"
                  type="info"
                  trigger="click"
                  @confirm="handleDelete(data.row.id)"
                >
                  <template #reference>
                    <a
                      class="operation"
                    >
                      <IconDel class="operation-icon"></IconDel>{{ $t('searchTable.columns.operations.delete') }}
                    </a>
                  </template>
                </tiny-popconfirm>
              </template>
            </tiny-grid-column>
          </tiny-grid>
        </div>
      </div>
    </div>
    <tiny-dialog-box
      v-model:visible="state.updateVisibility"
      :title="t('userInfo.table.updateTable')"
      width="700px"
      :close-on-click-modal="false"
      >
      <tiny-form
        ref="localeForm"
        :model="formModel"
        label-position="left"
        label-width="94px"
      >
        <tiny-row>
          <tiny-col :span="6">
            <tiny-form-item :label="$t('searchTable.columns.name')" prop="name">
              <tiny-input v-model="formModel.name" />
            </tiny-form-item>
          </tiny-col>
          <tiny-col :span="6">
            <tiny-form-item :label="$t('searchTable.columns.employeeNo')" prop="employeeNo">
              <tiny-input v-model="formModel.employeeNo" />
            </tiny-form-item>
          </tiny-col>
        </tiny-row>
        <tiny-row>
          <tiny-col :span="6">
            <tiny-form-item :label="$t('searchTable.columns.departmentLevel')" prop="departmentLevel">
              <tiny-select v-model="formModel.departmentLevel" :options="departmentLevelOptions" />
            </tiny-form-item>
          </tiny-col>
          <tiny-col :span="6">
            <tiny-form-item :label="$t('searchTable.columns.department')" prop="department">
              <tiny-select v-model="formModel.department" :options="departmentOptions" />
            </tiny-form-item>
          </tiny-col>
        </tiny-row>
        <tiny-row>
          <tiny-col :span="6">
            <tiny-form-item :label="$t('searchTable.columns.status')" prop="status">
              <tiny-select v-model="formModel.status" :options="statusOptions" />
            </tiny-form-item>
          </tiny-col>
          <tiny-col :span="6">
            <tiny-form-item :label="$t('searchTable.columns.workbenchName')" prop="workbenchName">
              <tiny-input v-model="formModel.workbenchName" />
            </tiny-form-item>
          </tiny-col>
        </tiny-row>
        <tiny-row>
          <tiny-col :span="6">
            <tiny-form-item :label="$t('searchTable.columns.project')" prop="project">
              <tiny-input v-model="formModel.project" />
            </tiny-form-item>
          </tiny-col>
          <tiny-col :span="6">
            <tiny-form-item :label="$t('searchTable.columns.type')" prop="type">
              <tiny-input v-model="formModel.type" />
            </tiny-form-item>
          </tiny-col>
        </tiny-row>
        <tiny-row>
          <tiny-col :span="6">
            <tiny-form-item :label="$t('searchTable.columns.address')" prop="address">
              <tiny-input v-model="formModel.address" />
            </tiny-form-item>
          </tiny-col>
          <tiny-col :span="6">
            <tiny-form-item :label="$t('searchTable.columns.roles')" prop="roles">
              <tiny-select v-model="formModel.roles" :options="rolesOptions" />
            </tiny-form-item>
          </tiny-col>
        </tiny-row>
        <tiny-row>
          <tiny-col :span="6">
            <tiny-form-item :label="$t('searchTable.columns.lastUpdateUser')" prop="lastUpdateUser">
              <tiny-select v-model="formModel.lastUpdateUser" :options="lastUpdateUserOptions" />
            </tiny-form-item>
          </tiny-col>
          <tiny-col :span="6">
            <tiny-form-item :label="$t('searchTable.columns.createTime')" prop="createTime">
              <tiny-date-picker v-model="formModel.createTime" placeholder="请选择日期"></tiny-date-picker>
            </tiny-form-item>
          </tiny-col>
        </tiny-row>
      </tiny-form>
      <template #footer>
        <tiny-button size="small" @click="state.updateVisibility = false">{{ $t('menu.btn.cancel') }}</tiny-button>
        <tiny-button size="small" type="primary" @click="handleUpdateSubmit">{{ $t('menu.btn.confirm') }}</tiny-button>
      </template>
    </tiny-dialog-box>
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
    DialogBox as TinyDialogBox,
    FileUpload as TinyFileUpload,
    DatePicker as TinyDatePicker,
    Popconfirm as TinyPopconfirm,
  } from '@opentiny/vue';
  import { iconEditor, iconDel, iconRefresh, iconSetting } from '@opentiny/vue-icon';
  import TinySearchBox from '@opentiny/vue-search-box';
  import {
    queryEmployeeList,
    deleteEmployee,
    QueryTaskParmas,
    getEmployeeInfo,
    updateEmployeeInfo,
  } from '@/api/list';
  import * as XLSX from 'xlsx';
  import { t } from '@opentiny/vue-locale';
  import TransitionFadeSlideGroup from '@/components/transition/transition-fade-slide-group.vue';

  const IconEditor = iconEditor();
  const IconDel = iconDel();
  const IconRefresh = iconRefresh()
  const IconSetting = iconSetting()
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
  const items = reactive([])
  // 加载效果
  const state = reactive<{
    loading: boolean;
    filterOptions: FilterOptions;
    updateVisibility: boolean;
  }>({
    loading: false,
    filterOptions: {} as FilterOptions,
    updateVisibility: false,
  });

  const pagerConfig = reactive({
    component: TinyPager,
    attrs: {
      currentPage: 1,
      pageSize: 10,
      pageSizes: [10, 20, 50, 100],
      total: 10,
      layout: 'total, sizes, prev, pager, next, jumper',
    },
  });

  let tableData = ref([]);
  const taskGrid = ref();
  const { loading, filterOptions } = toRefs(state);

  const createItems = (list) => {
    if (!list || !list.length) return;

    const excludeKeys = ['id', 'rank', 'description'];
    const fieldOptionsMap = {};
    
    let minDate = new Date();
    let maxDate = new Date();
    list.forEach(item => {
      Object.keys(item).forEach(key => {
        if(key === 'createTime'){
          const currentDate = new Date(item[key]);
          // 使用 getTime() 方法获取时间戳进行比较
          minDate = minDate.getTime() < currentDate.getTime() ? minDate : currentDate;
          maxDate = maxDate.getTime() > currentDate.getTime() ? maxDate : currentDate;
          return
        }
        if (excludeKeys.includes(key)) return;
        if (!fieldOptionsMap[key]) {
          fieldOptionsMap[key] = new Set();
        }
        fieldOptionsMap[key].add(item[key]);
      });
    });

    // 清空原 items
    items.length = 0;

    Object.entries(fieldOptionsMap).forEach(([key, valueSet]) => {
      items.push({
        label: t(`searchTable.columns.${key}`),
        field: key,
        options: Array.from(valueSet).map(i => ({ label: i }))
      });
    });
    items.push({
      label: t(`searchTable.columns.createTime`),
      field: 'createTime',
      type: 'datetimeRange',
      min: minDate,
      max: maxDate
    })
  };

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
      createItems(list)
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

  function handleRefresh() {
    taskGrid?.value.handleFetch('reload'); 
  }

  const localeForm = ref();
  const formModel = reactive({
    id: '',
    name: '',
    employeeNo: '',
    departmentLevel: '',
    department: '',
    status: '',
    workbenchName: '',
    project: '',
    type: '',
    address: '',
    roles: '',
    lastUpdateUser: '',
    createTime: '',
  });
  const departmentLevelOptions = reactive([
    { label: '一级', value: '一级' },
    { label: '二级', value: '二级' },
    { label: '三级', value: '三级' },
  ]);
  const departmentOptions = reactive([
    { label: '公共服务部', value: '公共服务部' },
    { label: '计算管理部', value: '计算管理部' },
  ]);
  const statusOptions = reactive([
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
  ]);
  const rolesOptions = reactive([
    { label: '前端', value: '前端' },
    { label: '后端', value: '后端' },
    { label: '测试', value: '测试' },
  ]);
  const lastUpdateUserOptions = reactive([
    { label: '张三', value: '张三' },
    { label: '李四', value: '李四' },
    { label: '王五', value: '王五' },
  ]);

  const handleUpdateSubmit = () => {
    localeForm.value.validate().then(() => {
      // 提交表单
      updateEmployeeInfo(formModel).then(() => {
        Modal.message({
          message: '更新成功',
          status: 'success',
        });
        handleRefresh()
        state.updateVisibility = false;
      });
    });
  };

  const handleUpdated  = async (id) => {
    const res = await getEmployeeInfo(id);
    Object.keys(formModel).forEach(key => {
      formModel[key] = res[key] || '';
    });
    state.updateVisibility = true; 
  }

  const importExcel = (files) => {
    const fileReader = new FileReader()
    fileReader.onload = (ev) => {
      try {
        const data = ev.target.result
        const workbook = XLSX.read(data, {
          type: 'binary'
        })
        // 取 Excel 的第一张 Sheet 表
        const wsname = workbook.SheetNames[0]
        // 生成 JSON 表格内容
        const ws = XLSX.utils.sheet_to_json(workbook.Sheets[wsname])
        // 将数据赋值给 Grid 数据源
        tableData.value = ws
        return true
        // 可以在这里给后端发请求，将读取的 Excel 数据存到数据库表中
      } catch (e) {
        return false
      }
    }
    fileReader.readAsBinaryString(files.raw)
    
  }

  // 导出
  const toCsvEvent = () => {
    taskGrid.value.exportCsv({
      filename: 'table',
      original: true,
      isHeader: false,
      useTabs: false,
      data: tableData.value,
    });
  };
</script>

<style scoped lang="less">
  @import './search-table.less';
</style>
