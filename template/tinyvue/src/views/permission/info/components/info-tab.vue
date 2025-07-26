<template>
  <div>
    <div class="tiny-fullscreen-scroll">
      <div class="tiny-fullscreen-wrapper">
        <div class="permission-add-btn">
          <tiny-button v-permission="'permission::add'" type="primary" round @click="handleAddPermission">{{
            $t('permissionInfo.modal.title.add') }}</tiny-button>
        </div>
        <div class="table">
          <tiny-grid 
          ref="roleGrid" 
          :auto-resize="true" 
          :fetch-data="fetchOption" 
          :pager="pagerConfig"
          :edit-config="{ trigger: 'click', mode: 'cell', showStatus: true }" 
          remote-filter
          @edit-closed="handlePermissionUpdateSubmit"
          >
            <tiny-grid-column field="id" :title="$t('permissionInfo.table.id')">
              <template #default="data">
                <span>{{ $t(`${data.row.id}`) }}</span>
              </template>
            </tiny-grid-column>
            <tiny-grid-column field="name" :title="$t('permissionInfo.table.name')" :filter="filter"
              :editor="{ component: 'input', autoselect: true }">
              <template #default="data">
                <span>{{ $t(`${data.row.name}`) }}</span>
              </template>
            </tiny-grid-column>
            <tiny-grid-column field="desc" :title="$t('permissionInfo.table.desc')"
              :editor="{ component: 'input', autoselect: true }">
              <template #default="data">
                <span>{{ $t(`${data.row.desc}`) }}</span>
              </template>
            </tiny-grid-column>
            <tiny-grid-column :title="$t('permissionInfo.table.operations')">
              <template #default="data">
                <tiny-popconfirm :title="$t('menuInfo.modal.title.confirm')" type="warning" trigger="click" @confirm="handleDelete(data.row)">
                  <template #reference>
                    <iconDel class="del-icon"></iconDel>
                    <a v-permission="'permission::remove'" class="operation-update">
                      {{ $t('permissionInfo.table.operations.delete') }}
                    </a>
                  </template>
                </tiny-popconfirm>
              </template>
            </tiny-grid-column>
          </tiny-grid>
        </div>
      </div>
    </div>
    <div v-if="state.isPermissionAdd">
      <tiny-modal
      v-model="state.isPermissionAdd" 
      :lock-scroll="true" 
      show-header 
      show-footer 
      width="700"  
      height="auto" 
      :title="$t('permissionInfo.modal.title.add')"
      >
        <template #default>
          <tiny-form ref="addForm" :model="state.permissionAddData" :rules="rules">
            <tiny-row>
              <tiny-col :span="6">
                <tiny-form-item :label="$t('permissionInfo.modal.input.name')" prop="name">
                  <tiny-input v-model="state.permissionAddData.name"></tiny-input>
                </tiny-form-item>
              </tiny-col>
              <tiny-col :span="6">
                <tiny-form-item :label="$t('permissionInfo.modal.input.permission')">
                  <tiny-input v-model="state.permissionAddData.desc"></tiny-input>
                </tiny-form-item>
              </tiny-col>
            </tiny-row>

          </tiny-form>
        </template>
        <template #footer>
          <tiny-button round @click="handlePermissionAddCancel">{{
            $t('menu.btn.cancel')
          }}</tiny-button>
          <tiny-button round type="primary" @click="handlePermissionAddSubmit">{{
            $t('menu.btn.confirm')
          }}</tiny-button>
  
        </template>
      </tiny-modal>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, unref } from 'vue';
import { useI18n } from 'vue-i18n';
import {
  GridColumn as TinyGridColumn,
  Grid as TinyGrid,
  Pager as TinyPager,
  Modal as TinyModal,
  Button as TinyButton,
  Form as TinyForm,
  FormItem as TinyFormItem,
  Row as TinyRow,
  Col as TinyCol,
  Input as TinyInput,
  Modal,
  TinyPopconfirm,
  Layout as TinyLayout,
} from '@opentiny/vue';
import { IconDel } from '@opentiny/vue-icon';
import { useUserStore } from '@/store';
import {
  getAllPermission,
  updatePermission,
  createPermission,
  deletePermission,
  Permission,
} from '@/api/permission';
import { useRouter } from 'vue-router';
import {
  FilterType,
  InputFilterValue,
  IPaginationMeta,
  Pager,
} from '@/types/global';

const roleGrid = ref();
const addForm = ref();
const iconDel = IconDel();

const { t } = useI18n();

// 加载效果
const state = reactive<{
  tableData: any;
  permissionAddData: any;
  isPermissionAdd: boolean;
}>({
  tableData: {} as any,
  permissionAddData: {} as any,
  isPermissionAdd: false,
});

// 校验规则
const rulesType = {
  required: true,
  trigger: 'blur',
};
const rules = computed(() => {
  return {
    name: [rulesType],
  };
});

const filter = {
  inputFilter: true,
};


const pagerConfig = reactive({
  component: TinyPager,
  attrs: {
    currentPage: 1,
    pageSize: 10,
    pageSizes: [10, 20, 50,100],
    total: 10,
    layout: 'sizes,total, prev, pager, next, jumper',
  },
});

const fetchOption = {
  api: ({ page, filters }: { page: Pager; filters: FilterType }) => {
    const { name } = filters;
    let exp = '';
    if (name) {
      const value = name.value as InputFilterValue;
      if (value.relation === 'contains') {
        exp += '%';
      }
      exp += value.text;
      if (value.relation === 'startwith' || value.relation === 'contains') {
        exp += '%';
      }
    }
    return fetchData(page.currentPage, page.pageSize, exp).then(
      ({ items, meta }) => {
        return {
          result: items,
          page: {
            total: meta.totalItems,
          },
        };
      },
    );
  },
  filiter: true,
};

// 请求数据接口方法
async function fetchData(page: number, size: number, name?: string) {
  const { data } = await getAllPermission(page, size, name);
  const { items, meta } = data as {
    items: Permission[];
    meta: IPaginationMeta;
  };
  return { items, meta };
}

async function handleDelete(permission: Permission) {
  try {
    await deletePermission(permission.id);
    TinyModal.message({
      message: '已删除',
      status: 'success',
    });
    roleGrid.value.handleFetch();
  } catch (error) {
    if (error.response && error.response.data) {
      const errorMessage = error.response.data.message || '未知错误';
      Modal.message({
        message: errorMessage,
        status: 'error',
      });
    }
  }
}

async function handlePermissionUpdateSubmit(args:any) {
      let data = args.row;
      let newTemp = {
        id: data.id,
        name: data.name,
        desc: data.desc,
      };
      try {
        await updatePermission(newTemp);
        Modal.message({
          message: t('permissionInfo.edit.success'),
          status: 'success',
        });
        roleGrid.value.handleFetch();
      } catch (error) {
        if (error.response && error.response.data) {
          const errorMessage = error.response.data.message || '未知错误';
          Modal.message({
            message: errorMessage,
            status: 'error',
          });
        }
      }

}

function handleAddPermission() {
  state.isPermissionAdd = true;
}

async function handlePermissionAddSubmit() {
  addForm.value
    .validate()
    .then(async () => {
      let data = state.permissionAddData;
      let newTemp = {
        name: data.name,
        desc: data.desc,
      };
      try {
        await createPermission(newTemp);
        Modal.message({
          message: t('permissionInfo.add.success'),
          status: 'success',
        });
        state.isPermissionAdd = false;
        state.permissionAddData = {} as any;
        roleGrid.value.handleFetch();
      } catch (error) {
        if (error.response && error.response.data) {
          const errorMessage = error.response.data.message || '未知错误';
          Modal.message({
            message: errorMessage,
            status: 'error',
          });
        }
      }
    })
    .catch(() => { });
}

async function handlePermissionAddCancel() {
  state.isPermissionAdd = false;
  state.permissionAddData = {} as any;
}
</script>

<style scoped lang="less">
#contain {
  height: 100%;
  padding: 15px;
  overflow: hidden;
}

.permission-add-btn {
  padding: 0 0 24px 0;
}

.table {
  padding-bottom: 20px;
  background-color: #fff;
}

.operation {
  &-delete {
    padding-right: 5px;
    color: red;
  }

  &-update {
    padding-right: 5px;
    color: #1890ff;
  }

  &-pwd-update {
    color: orange;
  }
}
.del-icon{
  fill: #1890ff;
  margin-right: 8px;
  font-size: 16px;
  margin-top: -3px;
}
.operation-update:hover{
  text-decoration: underline;
}
</style>
