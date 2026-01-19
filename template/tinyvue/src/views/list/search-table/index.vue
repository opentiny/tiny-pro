<script lang="ts" setup>
import type {
  QueryTaskParmas,
} from '@/api/list'
import {
  Modal,
  Button as TinyButton,
  Col as TinyCol,
  DatePicker as TinyDatePicker,
  DialogBox as TinyDialogBox,
  FileUpload as TinyFileUpload,
  Form as TinyForm,
  FormItem as TinyFormItem,
  Grid as TinyGrid,
  GridColumn as TinyGridColumn,
  Input as TinyInput,
  Pager as TinyPager,
  Popconfirm as TinyPopconfirm,
  Row as TinyRow,
  Select as TinySelect,
} from '@opentiny/vue'
import { iconDel, iconEditor, iconRefresh, iconSetting } from '@opentiny/vue-icon'
import { t } from '@opentiny/vue-locale'
import { reactive, ref, toRefs } from 'vue'
import * as XLSX from 'xlsx'
import {
  deleteEmployee,
  getEmployeeInfo,
  queryEmployeeList,
  updateEmployeeInfo,
} from '@/api/list'
import { useResponsive, useResponsiveSize } from '@/hooks/responsive'

const IconEditor = iconEditor()
const IconDel = iconDel()
const IconRefresh = iconRefresh()
const IconSetting = iconSetting()
const { gridSize } = useResponsiveSize()
const { sm } = useResponsive()
// 初始化请求数据
interface FilterOptions {
  id: string
  department: string
  roles: string
  dateRange: Array<string | Date>
  name: string
  status: string
  workbenchName: string
  project: string
  type: string
  address: string
}
const tags = ref([])

// 搜索配置
const items = reactive([])
// 加载效果
const state = reactive<{
  loading: boolean
  filterOptions: FilterOptions
  updateVisibility: boolean
}>({
  loading: false,
  filterOptions: {} as FilterOptions,
  updateVisibility: false,
})

const pagerConfigSm = {
  component: TinyPager,
  attrs: { currentPage: 1, pageSize: 10, pageSizes: [10, 20, 50, 100], total: 10, layout: 'total, prev, pager, next' },
}
const pagerConfigLg = {
  component: TinyPager,
  attrs: { currentPage: 1, pageSize: 10, pageSizes: [10, 20, 50, 100], total: 10, layout: 'sizes, total, prev, pager, next, jumper' },
}

const tableData = ref([])
const taskGrid = ref()
const { loading, filterOptions } = toRefs(state)

function createItems(list) {
  if (!list || !list.length)
    return

  const excludeKeys = ['id', 'rank', 'description']
  const fieldOptionsMap = {}

  let minDate = new Date()
  let maxDate = new Date()
  list.forEach((item) => {
    Object.keys(item).forEach((key) => {
      if (key === 'createTime') {
        const currentDate = new Date(item[key])
        // 使用 getTime() 方法获取时间戳进行比较
        minDate = minDate.getTime() < currentDate.getTime() ? minDate : currentDate
        maxDate = maxDate.getTime() > currentDate.getTime() ? maxDate : currentDate
        return
      }
      if (excludeKeys.includes(key))
        return
      if (!fieldOptionsMap[key]) {
        fieldOptionsMap[key] = new Set()
      }
      fieldOptionsMap[key].add(item[key])
    })
  })

  // 清空原 items
  items.length = 0

  Object.entries(fieldOptionsMap).forEach(([key, valueSet]) => {
    items.push({
      label: t(`searchTable.columns.${key}`),
      field: key,
      options: Array.from(valueSet).map(i => ({ label: i })),
    })
  })
  items.push({
    label: t(`searchTable.columns.createTime`),
    field: 'createTime',
    type: 'datetimeRange',
    min: minDate,
    max: maxDate,
  })
}

// 请求数据接口方法
async function fetchData(
  params: QueryTaskParmas = {
    pageIndex: 1,
    pageSize: 10,
    status: '',
  },
) {
  const searchInfo = {}
  if (filterOptions.value?.length) {
    filterOptions.value.forEach((item) => {
      searchInfo[item.field] = item.value
    })
  }

  const queryParmas = {
    searchInfo,
    ...params,
  }

  state.loading = true
  try {
    const { data } = await queryEmployeeList(queryParmas)
    const { data: list, total } = data
    tableData.value = list
    createItems(list)
    return {
      result: list,
      page: { total },
    }
  }
  finally {
    state.loading = false
  }
}

const fetchDataOption = reactive({
  api: ({ page }: any) => {
    const { currentPage, pageSize } = page

    return fetchData({
      pageIndex: currentPage,
      pageSize,
    })
  },
})
function handleDelete(id: string) {
  deleteEmployee(id).then(() => {
    Modal.message({
      message: '已删除',
      status: 'success',
    })
  })
}

// form的button
function reloadGrid(filters) {
  filterOptions.value = filters
  taskGrid?.value.handleFetch('reload')
}

function handleRefresh() {
  taskGrid?.value.handleFetch('reload')
}

const localeForm = ref()
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
})
const departmentLevelOptions = reactive([
  { label: '一级', value: '一级' },
  { label: '二级', value: '二级' },
  { label: '三级', value: '三级' },
])
const departmentOptions = reactive([
  { label: '公共服务部', value: '公共服务部' },
  { label: '计算管理部', value: '计算管理部' },
])
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
])

function getStatusText(status: string) {
  return statusOptions.find(({ value }) => status === value)?.label || ''
}

const rolesOptions = reactive([
  { label: '前端', value: '前端' },
  { label: '后端', value: '后端' },
  { label: '测试', value: '测试' },
])
const lastUpdateUserOptions = reactive([
  { label: '张三', value: '张三' },
  { label: '李四', value: '李四' },
  { label: '王五', value: '王五' },
])

function handleUpdateSubmit() {
  localeForm.value.validate().then(() => {
    // 提交表单
    updateEmployeeInfo(formModel).then(() => {
      Modal.message({
        message: '更新成功',
        status: 'success',
      })
      handleRefresh()
      state.updateVisibility = false
    })
  })
}

async function handleUpdated(id) {
  const res = await getEmployeeInfo(id)
  Object.keys(formModel).forEach((key) => {
    formModel[key] = res[key] || ''
  })
  state.updateVisibility = true
}

function importExcel(files) {
  const fileReader = new FileReader()
  fileReader.onload = (ev) => {
    try {
      const data = ev.target.result
      const workbook = XLSX.read(data, {
        type: 'binary',
      })
      // 取 Excel 的第一张 Sheet 表
      const wsname = workbook.SheetNames[0]
      // 生成 JSON 表格内容
      const ws = XLSX.utils.sheet_to_json(workbook.Sheets[wsname])
      // 将数据赋值给 Grid 数据源
      tableData.value = ws
      return true
      // 可以在这里给后端发请求，将读取的 Excel 数据存到数据库表中
    }
    catch {
      return false
    }
  }
  fileReader.readAsBinaryString(files.raw)
}

// 导出
function toCsvEvent() {
  taskGrid.value.exportCsv({
    filename: 'table',
    original: true,
    isHeader: false,
    useTabs: false,
    data: tableData.value,
  })
}
</script>

<template>
  <div class="search-container-list">
    <Breadcrumb :items="['menu.list', 'menu.list.searchTable']" />

    <div class="search-table-container">
      <div class="button-group flex-wrap gap-4 max-sm:gap-[3%]">
        <TinyButton class="max-sm:w-[30%]">
          {{ $t('userInfo.table.operations.delete') }}
        </TinyButton>
        <TinyFileUpload class="max-sm:w-[30%]" action="#" accept=".xls,.xlsx" @change="importExcel">
          <TinyButton class="max-sm:w-full">
            {{ $t('userInfo.table.import') }}
          </TinyButton>
        </TinyFileUpload>
        <TinyButton class="max-sm:w-[30%]" @click="toCsvEvent">
          {{ $t('userInfo.table.export') }}
        </TinyButton>
      </div>
      <div class="tiny-fullscreen-scroll">
        <div class="tiny-fullscreen-wrapper">
          <div class="btn max-sm:flex-wrap">
            <transition-fade-down-group>
              <div class="search-box-container">
                <tiny-search-box
                  v-model="tags"
                  :items="items"
                  :empty-placeholder="$t('searchTable.form.placeholder')"
                  @change="reloadGrid"
                />
              </div>
              <div class="button-group">
                <TinyButton :icon="IconRefresh" @click="handleRefresh" />
                <TinyButton :icon="IconSetting" />
              </div>
            </transition-fade-down-group>
          </div>
          <TinyGrid
            :key="sm ? 'sm' : 'lg'"
            ref="taskGrid"
            :fetch-data="fetchDataOption"
            :pager="sm ? pagerConfigSm : pagerConfigLg"
            :loading="loading"
            :size="gridSize"
            :height="640"
            :auto-resize="true"
            align="center"
          >
            <TinyGridColumn type="selection" width="60" />
            <TinyGridColumn
              field="name"
              :title="$t('searchTable.columns.name')"
            />
            <TinyGridColumn
              field="employeeNo"
              :title="$t('searchTable.columns.employeeNo')"
              sortable
            />
            <TinyGridColumn
              field="departmentLevel"
              :title="$t('searchTable.columns.departmentLevel')"
            />
            <TinyGridColumn
              field="department"
              :title="$t('searchTable.columns.department')"
            />
            <TinyGridColumn
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
                  <span class="status-dot" />
                  <span class="status-text">
                    {{ getStatusText(row.status) }}
                  </span>
                </span>
              </template>
            </TinyGridColumn>
            <TinyGridColumn
              field="workbenchName"
              :title="$t('searchTable.columns.workbenchName')"
            />
            <TinyGridColumn
              field="project"
              :title="$t('searchTable.columns.project')"
            />
            <TinyGridColumn
              field="type"
              :title="$t('searchTable.columns.type')"
            />
            <TinyGridColumn
              field="address"
              :title="$t('searchTable.columns.address')"
            />
            <TinyGridColumn
              field="roles"
              :title="$t('searchTable.columns.roles')"
            />
            <TinyGridColumn
              field="lastUpdateUser"
              :title="$t('searchTable.columns.lastUpdateUser')"
            />
            <TinyGridColumn
              field="createTime"
              :title="$t('searchTable.columns.createTime')"
            />
            <TinyGridColumn
              :title="$t('searchTable.columns.operations')"
            >
              <template #default="data">
                <a
                  class="operation"
                  @click="handleUpdated(data.row.id)"
                >
                  <IconEditor class="operation-icon" />{{ $t('userInfo.table.operations.update') }}
                </a>
                <TinyPopconfirm
                  title="确定要删除此用户吗？"
                  type="info"
                  trigger="click"
                  @confirm="handleDelete(data.row.id)"
                >
                  <template #reference>
                    <a
                      class="operation"
                    >
                      <IconDel class="operation-icon" />{{ $t('searchTable.columns.operations.delete') }}
                    </a>
                  </template>
                </TinyPopconfirm>
              </template>
            </TinyGridColumn>
          </TinyGrid>
        </div>
      </div>
    </div>
    <TinyDialogBox
      v-model:visible="state.updateVisibility"
      :title="t('userInfo.table.updateTable')"
      width="700px"
      :close-on-click-modal="false"
    >
      <TinyForm
        ref="localeForm"
        :model="formModel"
        label-position="left"
        label-width="94px"
      >
        <TinyRow>
          <TinyCol :span="6">
            <TinyFormItem :label="$t('searchTable.columns.name')" prop="name">
              <TinyInput v-model="formModel.name" />
            </TinyFormItem>
          </TinyCol>
          <TinyCol :span="6">
            <TinyFormItem :label="$t('searchTable.columns.employeeNo')" prop="employeeNo">
              <TinyInput v-model="formModel.employeeNo" />
            </TinyFormItem>
          </TinyCol>
        </TinyRow>
        <TinyRow>
          <TinyCol :span="6">
            <TinyFormItem :label="$t('searchTable.columns.departmentLevel')" prop="departmentLevel">
              <TinySelect v-model="formModel.departmentLevel" :options="departmentLevelOptions" />
            </TinyFormItem>
          </TinyCol>
          <TinyCol :span="6">
            <TinyFormItem :label="$t('searchTable.columns.department')" prop="department">
              <TinySelect v-model="formModel.department" :options="departmentOptions" />
            </TinyFormItem>
          </TinyCol>
        </TinyRow>
        <TinyRow>
          <TinyCol :span="6">
            <TinyFormItem :label="$t('searchTable.columns.status')" prop="status">
              <TinySelect v-model="formModel.status" :options="statusOptions" />
            </TinyFormItem>
          </TinyCol>
          <TinyCol :span="6">
            <TinyFormItem :label="$t('searchTable.columns.workbenchName')" prop="workbenchName">
              <TinyInput v-model="formModel.workbenchName" />
            </TinyFormItem>
          </TinyCol>
        </TinyRow>
        <TinyRow>
          <TinyCol :span="6">
            <TinyFormItem :label="$t('searchTable.columns.project')" prop="project">
              <TinyInput v-model="formModel.project" />
            </TinyFormItem>
          </TinyCol>
          <TinyCol :span="6">
            <TinyFormItem :label="$t('searchTable.columns.type')" prop="type">
              <TinyInput v-model="formModel.type" />
            </TinyFormItem>
          </TinyCol>
        </TinyRow>
        <TinyRow>
          <TinyCol :span="6">
            <TinyFormItem :label="$t('searchTable.columns.address')" prop="address">
              <TinyInput v-model="formModel.address" />
            </TinyFormItem>
          </TinyCol>
          <TinyCol :span="6">
            <TinyFormItem :label="$t('searchTable.columns.roles')" prop="roles">
              <TinySelect v-model="formModel.roles" :options="rolesOptions" />
            </TinyFormItem>
          </TinyCol>
        </TinyRow>
        <TinyRow>
          <TinyCol :span="6">
            <TinyFormItem :label="$t('searchTable.columns.lastUpdateUser')" prop="lastUpdateUser">
              <TinySelect v-model="formModel.lastUpdateUser" :options="lastUpdateUserOptions" />
            </TinyFormItem>
          </TinyCol>
          <TinyCol :span="6">
            <TinyFormItem :label="$t('searchTable.columns.createTime')" prop="createTime">
              <TinyDatePicker v-model="formModel.createTime" placeholder="请选择日期" />
            </TinyFormItem>
          </TinyCol>
        </TinyRow>
      </TinyForm>
      <template #footer>
        <TinyButton size="small" @click="state.updateVisibility = false">
          {{ $t('menu.btn.cancel') }}
        </TinyButton>
        <TinyButton size="small" type="primary" @click="handleUpdateSubmit">
          {{ $t('menu.btn.confirm') }}
        </TinyButton>
      </template>
    </TinyDialogBox>
  </div>
</template>

<style scoped lang="less">
  @import './search-table.less';
</style>
