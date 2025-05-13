<template>
  <div class="tiny-fullscreen-scroll">
    <div class="tiny-fullscreen-wrapper">
      <div class="user-add-btn">
        <tiny-button
          v-permission="'user::add'"
          type="primary"
          @click="handleAddUser"
          round
          >{{ $t('userInfo.modal.title.add') }}
        </tiny-button>
      </div>
      <div class="table">
        <tiny-grid
          ref="grid"
          :fetch-data="fetchDataOption"
          :pager="pagerConfig"
          :auto-resize="true"
          remote-filter
        >
          <tiny-grid-column type="selection" width="60"></tiny-grid-column>
          <tiny-grid-column type="expand" width="60">
            <template #default="{ row }">
              <UserSetting :email="row.email" @confirm="(props, value) => row[props] = value" />
            </template>
          </tiny-grid-column>
          <tiny-grid-column field="id" :title="$t('userInfo.table.id')" show-overflow="tooltip">
            <template #default="data">
              <span>{{ $t(`${data.row.id}`) }}</span>
            </template>
          </tiny-grid-column>
          <tiny-grid-column
            field="name"
            :filter="inputFilter"
            :title="$t('userInfo.table.name')" 
            show-overflow="tooltip"
          >
            <template #default="data">
              <span>{{ $t(`${data.row.name}`) }}</span>
            </template>
          </tiny-grid-column>
          <tiny-grid-column
            field="email"
            :filter="inputFilter"
            :title="$t('userInfo.table.email')" 
            show-overflow="tooltip"
          >
            <template #default="data">
              <span>{{ $t(`${data.row.email}`) }}</span>
            </template>
          </tiny-grid-column>
          <tiny-grid-column
            field="department"
            :title="$t('userInfo.table.department')" 
            show-overflow="tooltip"
          >
            <template #default="data">
              <span v-if="data.row.department !== null">{{
                $t(`${data.row.department}`)
              }}</span>
            </template>
          </tiny-grid-column>
          <tiny-grid-column
            field="employeeType"
            :title="$t('userInfo.table.employeeType')"
             show-overflow="tooltip"
          >
            <template #default="data">
              <span v-if="data.row.employeeType !== null">{{
                $t(`${data.row.employeeType}`)
              }}</span>
            </template>
          </tiny-grid-column>
          <tiny-grid-column
            field="role"
            :filter="jobFilter"
            :title="$t('userInfo.table.job')" 
            show-overflow="tooltip"
          >
            <template #default="data">
              <span>{{ $t(`${data.row.role[0]?.name}`) }}</span>
            </template>
          </tiny-grid-column>
          <tiny-grid-column
            field="probationStart"
            :title="$t('userInfo.table.probationStart')" 
            show-overflow="tooltip"
          >
            <template #default="data">
              <span v-if="data.row.probationStart !== null">{{
                $t(`${data.row.probationStart}`)
              }}</span>
            </template>
          </tiny-grid-column>
          <tiny-grid-column
            field="probationEnd"
            :title="$t('userInfo.table.probationEnd')" 
            show-overflow="tooltip"
          >
            <template #default="data">
              <span v-if="data.row.probationEnd !== null">{{
                $t(`${data.row.probationEnd}`)
              }}</span>
            </template>
          </tiny-grid-column>
          <tiny-grid-column
            field="probationDuration"
            :title="$t('userInfo.table.probationDuration')" 
            show-overflow="tooltip"
          >
            <template #default="data">
              <span v-if="data.row.probationDuration !== null"
                >{{ $t(`${data.row.probationDuration}`)
                }}{{ $t('userInfo.day') }}</span
              >
            </template>
          </tiny-grid-column>
          <tiny-grid-column
            field="address"
            :title="$t('userInfo.table.address')" 
            show-overflow="tooltip"
          >
            <template #default="data">
              <span v-if="data.row.address !== null">{{
                $t(`${data.row.address}`)
              }}</span>
            </template>
          </tiny-grid-column>
          <tiny-grid-column field="status" :title="$t('userInfo.table.status')" show-overflow="tooltip">
            <template #default="data">
              <div class="tiny-col-status">
                <img
                  v-if="data.row.status == 1"
                  src="@/assets/images/success.png"
                  alt="success"
                />
                <img
                  v-else-if="data.row.status == 2"
                  src="@/assets/images/error.png"
                  alt="error"
                />
                <img
                  v-else-if="data.row.status == 3"
                  src="@/assets/images/tip2.png"
                  alt="tip"
                />
                <span>{{ STATUSDATA[data.row.status]}}</span>
              </div>
            </template>
          </tiny-grid-column>
          <tiny-grid-column
            :title="$t('userInfo.table.operations')"
            align="center" 
            show-overflow="tooltip"
            width="178"
          >
            <template #default="data">
              <a
                v-permission="'user::password::force-update'"
                class="operation-pwd-update"
                @click="handlePwdUpdate(data.row.email)"
              >
                <IconCommission class="operation-icon"></IconCommission>
                {{ $t('userInfo.table.operations.pwdUpdate') }}
              </a>
              <a
                v-permission="'user::remove'"
                class="operation-delete"
                @click="handleDelete(data.row.email)"
              >
                <IconDel class="operation-icon"></IconDel>
                {{ $t('userInfo.table.operations.delete') }}
              </a>
            </template>
          </tiny-grid-column>
        </tiny-grid>
      </div>
    </div>
  </div>
  <div v-if="state.isUserAdd">
    <tiny-modal
      v-model="state.isUserAdd"
      :lock-scroll="true"
      mask-closable="true"
      height="auto"
      width="800"
      :title="$t('userInfo.modal.title.add')"
    >
      <UserAdd @confirm="onAddConfirm"></UserAdd>
    </tiny-modal>
  </div>
  <div v-if="state.isPwdUpdate">
    <tiny-modal
      v-model="state.isPwdUpdate"
      :lock-scroll="true"
      show-header
      show-footer
      mask-closable="true"
      height="auto"
      width="600"
      :title="$t('userInfo.modal.title.pwdUpdate')"
    >
      <template #default>
        <tiny-layout>
          <tiny-form
            :model="state.pwdData"
            :rules="rules"
            label-width="150px"
            :label-align="true"
            label-position="left"
          >
            <tiny-row :flex="true" justify="left">
              <tiny-col :span="10" label-width="100px">
                <tiny-form-item :label="$t('userInfo.table.email')">
                  <label>{{ state.pwdData.email }}</label>
                </tiny-form-item>
              </tiny-col>
            </tiny-row>
            <tiny-row :flex="true" justify="left">
              <tiny-col :span="10" label-width="100px">
                <tiny-form-item
                  :label="$t('userInfo.modal.input.newPassword')"
                  prop="newPassword"
                >
                  <tiny-input
                    v-model="state.pwdData.newPassword"
                    type="password"
                    show-password
                  ></tiny-input>
                </tiny-form-item>
              </tiny-col>
            </tiny-row>

            <tiny-row :flex="true" justify="left">
              <tiny-col :span="10" label-width="100px">
                <tiny-form-item
                  :label="$t('userInfo.modal.input.confirmNewPassword')"
                  prop="confirmNewPassword"
                >
                  <tiny-input
                    v-model="state.pwdData.confirmNewPassword"
                    type="password"
                    show-password
                  ></tiny-input>
                </tiny-form-item>
              </tiny-col>
            </tiny-row>
          </tiny-form>
        </tiny-layout>
      </template>
      <template #footer>
        <tiny-button type="primary" @click="handlePwdUpdateSubmit"
          >{{ $t('menu.btn.confirm') }}
        </tiny-button>
        <tiny-button @click="handlePwdUpdateCancel"
          >{{ $t('menu.btn.cancel') }}
        </tiny-button>
      </template>
    </tiny-modal>
  </div>
</template>

<script lang="ts" setup>
  import { reactive, computed, ref } from 'vue';
  import { useI18n } from 'vue-i18n';
  import {
    Loading,
    Modal,
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
  } from '@opentiny/vue';
  import { iconCommission, iconDel } from '@opentiny/vue-icon';
  import { useUserStore } from '@/store';
  import { getAllUser, deleteUser, updatePwdAdmin } from '@/api/user';
  import { useRouter } from 'vue-router';
  import { getAllRole } from '@/api/role';
  import { FilterType } from '@/types/global';
  import UserAdd from '../../useradd/index.vue';
  import UserSetting from '../../setting/index.vue';
  import { STATUSDATA } from '../../const'

  const IconCommission = iconCommission();
  const IconDel = iconDel();
  const { t } = useI18n();
  const router = useRouter();
  const grid = ref();
  // 加载效果
  const state = reactive<{
    loading: any;
    tableData: any;
    pageData: any;
    isPwdUpdate: boolean;
    isUserAdd: boolean;
    pwdData: any;
    email: string;
  }>({
    loading: null,
    tableData: [] as any,
    pageData: [] as any,
    isPwdUpdate: false,
    isUserAdd: false,
    pwdData: {} as any,
    email: '',
  });

  // 变量设置
  const userStore = useUserStore();

  const inputFilter = {
    inputFilter: true,
  };

  const jobFilter = ref({
    multi: true,
    enumable: true,
    values: (await getAllRole()).data.map((item) => {
      return {
        label: item.name,
        value: item.id,
      };
    }),
  });

  const pagerConfig = reactive({
    component: TinyPager,
    attrs: {
      currentPage: 1,
      pageSize: 10,
      pageSizes: [5, 10, 15, 20],
      total: 10,
      layout: 'total, sizes, prev, pager, next, jumper',
    },
  });

  // 校验规则
  const rulesType = {
    required: true,
    trigger: 'blur',
  };
  const rules = computed(() => {
    return {
      newPassword: [rulesType],
      confirmNewPassword: [rulesType],
    };
  });

  // 请求数据接口方法
  const fetchData = async (
    params: { pageIndex: 1; pageSize: 10 },
    filters: FilterType,
  ) => {
    userStore.setInfo({ reset: false, submit: false });
    state.loading = Loading.service({
      text: 'loading...',
      target: document.getElementById('contain'),
      background: 'rgba(0, 0, 0, 0.7)',
    });
    try {
      const { data } = await getAllUser(
        params.pageIndex,
        params.pageSize,
        filters,
      );
      const total = data.meta.totalItems;
      return {
        result: data.items,
        page: { total },
      };
    } finally {
      state.loading.close();
    }
  };

  const fetchDataOption = reactive({
    api: ({ page, filters }: any) => {
      const { currentPage, pageSize } = page;
      return fetchData(
        {
          pageIndex: currentPage,
          pageSize,
        },
        filters,
      );
    },
    filter: true,
  });


  const onAddConfirm = async () => {
    grid.value.handleFetch().then(() => {
      state.isUserAdd = false;
    });
  };

  const handleDelete = async (email: string) => {
    deleteUser(email)
      .then((res) => {
        TinyModal.message({
          message: '已删除',
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
      });
  };

  const handlePwdUpdate = (email: string) => {
    state.isPwdUpdate = true;
    state.pwdData.email = email;
  };

  const handlePwdUpdateCancel = () => {
    state.isPwdUpdate = false;
    state.pwdData = {} as any;
  };

  const handleAddUser = () => {
    state.isUserAdd = true;
  };

  async function handlePwdUpdateSubmit() {
    let data = state.pwdData;
    let newTemp = {
      email: data.email,
      newPassword: data.newPassword,
      confirmNewPassword: data.confirmNewPassword,
    };
    if (newTemp.newPassword !== newTemp.confirmNewPassword) {
      TinyModal.message({
        message: t('userInfo.modal.message.error'),
        status: 'error',
      });
    } else {
      try {
        await updatePwdAdmin(newTemp);
        TinyModal.message({
          message: t('baseForm.form.submit.success'),
          status: 'success',
        });
        state.pwdData = {} as any;
        state.isPwdUpdate = false;
      } catch (error) {
        if (error.response && error.response.data) {
          const errorMessage = error.response.data.message || '未知错误';
          TinyModal.message({
            message: errorMessage,
            status: 'error',
          });
        }
      }
    }
  }
</script>

<style scoped lang="less">
  .user-add-btn {
    padding: 10px 0 10px 10px;
  }

  #contain {
    height: 100%;
    padding: 15px;
    overflow: hidden;
  }

  .table {
    padding-bottom: 20px;
    background-color: #fff;
  }

  .operation {
    &-pwd-update {
      padding-right: 16px;
      color: #1890ff;
    }

    &-delete {
      color: #1890ff;
    }

    &-icon {
      margin-right: 3px;
      font-size: 16px;
      fill: currentColor;
    }
  }

 .tiny-col-status {
    display: flex;
    align-items: center;
    font-size: 14px;
    line-height: 22px;
    
    img {
      width: 14px;
      height: 14px;
      margin-right: 9px;
    }
  }  
 
</style>
