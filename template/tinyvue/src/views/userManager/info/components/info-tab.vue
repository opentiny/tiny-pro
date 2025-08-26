<template>
  <div class="tiny-fullscreen-scroll">
    <div class="tiny-fullscreen-wrapper">
      <div class="user-header-btn">
        <tiny-button
          v-permission="'user::add'"
          type="primary"
          round
          @click="handleAddUser"
          >{{ $t('userInfo.modal.title.add') }}
        </tiny-button>
        <tiny-button
          v-permission="'user::batch-remove'"
          round
          @click="handleBatchDeleteUser"
          >{{ $t('locale.batchRemove') }}
        </tiny-button>
      </div>
      <div class="table">
        <tiny-grid
          ref="grid"
          :fetch-data="fetchDataOption"
          :pager="pagerConfig"
          :auto-resize="true"
          remote-filter
          :edit-config="{ trigger: 'click', mode: 'cell', showStatus: true }"
        >
          <tiny-grid-column type="selection" width="3%"></tiny-grid-column>
          <tiny-grid-column type="expand" width="3%">
            <template #default="{ row }">
              <UserDetail
                :email="row.email"
                :status-map="statusMap"
                @confirm="(props, value) => row[props] = value"
              />
            </template>
          </tiny-grid-column>
          <tiny-grid-column
            field="id"
            :title="$t('userInfo.table.id')"
            show-overflow="tooltip"
            width="3%"
          >
            <template #default="data">
              <span>{{ $t(`${data.row.id}`) }}</span>
            </template>
          </tiny-grid-column>
          <tiny-grid-column
            field="name"
            :filter="inputFilter"
            :title="$t('userInfo.table.name')"
            show-overflow="tooltip"
            width="10%"
            :editor="{
              component: 'input',
              autofocus: true,
              events: {
                blur: handleUpdate,
                keyup:  handleKeyup
              }
            }"
          >
            <template #default="data">
              <span>{{ $t(`${data.row.name}`) }}</span>
            </template>
          </tiny-grid-column>
          <tiny-grid-column
            field="email"
            :filter="inputFilter"
            :title="$t('userInfo.table.email')"
            width="9%"
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
            width="6%"
            :editor="{
              component: 'input',
              autofocus: true,
              events: {
                blur: handleUpdate,
                keyup:  handleKeyup
              }
            }"
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
            width="6%"
            :editor="{
              component: TinySelect,
              attrs: {
                options: projectData,
                textField: 'label',
                valueField: 'label'
              },
              events: {
                keyup:  handleKeyup,
                change: handleSelectChange
              }
            }"
          >
            <template #default="data">
              <span v-if="data.row.employeeType !== null">{{
                $t(`${data.row.employeeType}`)
              }}</span>
            </template>
          </tiny-grid-column>
          <tiny-grid-column
            field="roleIds"
            :filter="jobFilter"
            :title="$t('userInfo.table.job')"
            show-overflow="tooltip"
            width="8%"
            format-text="enum"
            :format-config="{
              data: state.roleData,
              label: 'name',
              value: 'id'
            }"
            :editor="{
              component: TinySelect,
              attrs: {
                options: state.roleData,
                textField: 'name',
                valueField: 'id',
              },
              events: {
                keyup:  handleKeyup,
                change: handleSelectChange,
              }
            }"
          >
            <template #default="data">
              <span v-if="data.row.role[0]">{{ $t(`${data.row.role[0]?.name}`) }}</span>
            </template>
          </tiny-grid-column>
          <tiny-grid-column
            field="probationStart"
            :title="$t('userInfo.table.probationStart')"
            show-overflow="tooltip"
            width="9%"
            :editor="{
              component: TinyDatePicker,
              attrs: {
                valueFormat: 'yyyy-MM-dd'
              },
              events: {
                blur:  handleDatePickerBlur
              }
            }"
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
            width="9%"
            :editor="{
              component: TinyDatePicker,
              attrs: {
                valueFormat: 'yyyy-MM-dd'
              },
              events: {
                blur:  handleDatePickerBlur
              }
            }"
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
            width="6%"
            :editor="{
              component: 'input',
              autofocus: true,
              events: {
                blur: handleUpdate,
                keyup:  handleKeyup
              }
            }"
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
            width="11%"
            :editor="{
              component: 'input',
              autofocus: true,
              events: {
                blur: handleUpdate,
                keyup:  handleKeyup
              }
            }"
          >
            <template #default="data">
              <span v-if="data.row.address !== null">{{
                $t(`${data.row.address}`)
              }}</span>
            </template>
          </tiny-grid-column>
          <tiny-grid-column
            field="status"
            :title="$t('userInfo.table.status')"
            show-overflow="tooltip"
            width="6%"
            :editor="{
              component: TinySelect,
              attrs: {
                options: statusData,
                textField: 'label',
                valueField: 'value'
              },
              events: {
                keyup: handleKeyup,
                change: handleSelectChange
              }
            }"
          >
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
                <span>{{ statusMap[data.row.status]}}</span>
              </div>
            </template>
          </tiny-grid-column>
          <tiny-grid-column
            :title="$t('userInfo.table.operations')"
            show-overflow="tooltip"
            width="11%"
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
              <tiny-popconfirm
                title="确定要删除此用户吗？"
                type="info"
                trigger="click"
                @confirm="handleDelete(data.row.email)"
              >
                <template #reference>
                  <a
                    v-permission="'user::remove'"
                    class="operation-delete"
                  >
                    <IconDel class="operation-icon"></IconDel>
                    {{ $t('userInfo.table.operations.delete') }}
                  </a>
                </template>
              </tiny-popconfirm>
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
      height="auto"
      width="700"
      :title="$t('userInfo.modal.title.add')"
    >
      <UserAdd
        :status-data="statusData"
        :project-data="projectData"
        @confirm="onAddConfirm"
      ></UserAdd>
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
    Select as TinySelect,
    DatePicker as TinyDatePicker,
    Popconfirm as TinyPopconfirm,
  } from '@opentiny/vue';
  import { iconCommission, iconDel } from '@opentiny/vue-icon';
  import { useUserStore } from '@/store';
  import { getAllUser, deleteUser, updatePwdAdmin, batchDeleteUsers, updateUserInfo } from '@/api/user';
  import { getSimpleDate } from '@/utils/time';
  import { getAllRole } from '@/api/role';
  import { FilterType } from '@/types/global';
  import { isUndefined } from '@/utils/is';
  import UserAdd from '../../useradd/index.vue';
  import UserDetail from '../../user-detail/index.vue';

  const IconCommission = iconCommission();
  const IconDel = iconDel();
  const { t } = useI18n();
  const grid = ref();
  const state = reactive<{
    loading: any;
    tableData: any;
    pageData: any;
    isPwdUpdate: boolean;
    isUserAdd: boolean;
    pwdData: any;
    email: string;
    roleData: any;
  }>({
    loading: null,
    tableData: [] as any,
    pageData: [] as any,
    isPwdUpdate: false,
    isUserAdd: false,
    pwdData: {} as any,
    email: '',
    roleData: [] as any,
  });

  const statusData = [
    {
      value: 1,
      label: t('userInfo.table.activeStatus'),
    },
    {
      value: 2,
      label: t('userInfo.table.disabledStatus'),
    },
    {
      value: 3,
      label: t('searchTable.form.status.doing'),
    },
  ];

  const statusMap = {
    1: t('userInfo.table.activeStatus'),
    2: t('userInfo.table.disabledStatus'),
    3: t('searchTable.form.status.doing'),
  };

  const projectData = [
    {
      value: '1',
      label: t("userInfo.table.socialRecruitment"),
    },
    {
      value: '2',
      label: t("userInfo.table.schoolRecruitment"),
    },
    {
      value: '3',
      label: t("userInfo.table.jobTransfer"),
    },
  ];

  // 变量设置
  const userStore = useUserStore();

  async function fetchRole() {
    const { data } = await getAllRole();
    state.roleData = data;
  }

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
      pageSizes: [10, 20, 50, 100],
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

  const handleBatchDeleteUser = () => {
    const rowEmails = grid.value.getAllSelection().flatMap((row) => row.email);
    if(rowEmails.length === 0) {
      TinyModal.message({
        message: '请选择要删除的用户',
        status: 'error',
      });
      return;
    }
    TinyModal.confirm({
      title: '删除确认',
      message: '确定要批量删除选中的用户吗？',
      onConfirm: () => {
        batchDeleteUsers(rowEmails)
          .then(() => {
            TinyModal.message({
              message: '批量删除成功',
              status: 'success',
            });
            // 可以根据需求更新数据
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
      }
    });
  }

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
  const handleSelectChange = (table: any, value) => {
    handleUpdate(table, {target: {value}});
  }
  const handleKeyup = (table: any, event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleUpdate(table, event);
    }
  };

  const handleDatePickerBlur = (table, vm) => {
    handleUpdate(table, { target: { value: vm.modelValue } });
  };

  // 处理提交
  const handleUpdate = async ({ row, column }, { target: { value } }) => {
    const { property } = column;
    if(value) {
      let data = row;
      let newTemp = {
        email: data.email,
        name: data.name,
        address: data.address,
        department: data.department,
        roleIds: isUndefined(data.role[0]?.id) ? [] : [data.role[0]?.id],
        employeeType: data.employeeType,
        probationDuration: data.probationDuration,
        probationStart: data.probationStart,
        probationEnd: data.probationEnd,
        protocolStart: data.protocolStart,
        protocolEnd: data.protocolEnd,
        status: data.status,
      };
      if(property === 'roleIds') {
        const roleIds = [value ?? newTemp.roleIds[0]];
        newTemp.roleIds = roleIds;
      } else if(property !== 'status'){
        newTemp[property] = value;
      }

      try {
        await updateUserInfo(newTemp);
        TinyModal.message({
          message: t('baseForm.form.submit.success'),
          status: 'success',
        });

        grid.value.handleFetch();
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
  };

  // 请求职位类型
  fetchRole();
</script>

<style scoped lang="less">
  .user-header-btn {
    margin: 0px 0px 16px;

    .tiny-button {
      margin: 0 8px 0 0;
    }
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
