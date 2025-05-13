<template>
  <ul class="tiny-info-expand">
    <li>
      <span class="title">{{ $t('userInfo.table.id') }}：</span>
      <span class="desc">{{ state.userData.id }}</span>
    </li>
    <li>
      <span class="title">{{ $t('userInfo.table.name') }}：</span><!-- 使用一个ref来控制输入框的显示与隐藏 -->
      <span 
        v-if="!state.userData.isEditingName" 
        @click="detailClick('isEditingName')"
        class="desc"
      >
        {{ $t(`${state.userData.name}`) }}
      </span>
      <tiny-input
        v-else
        autofocus
        v-model="state.userData.name"
        @blur="handleNameUpdate('name', 'isEditingName')"
        @keyup.enter="handleNameUpdate('name', 'isEditingName')"
        class="desc"
      ></tiny-input>
    </li>
    <li>
      <span class="title">{{ $t('userInfo.table.email') }}：</span>
      <span 
        v-if="!state.userData.isEditingEmail"
        @click="detailClick('isEditingEmail')"
        class="desc"
      >
        {{ $t(`${state.userData.email}`) }}
      </span>
      <tiny-input
        v-else
        autofocus
        v-model="state.userData.email"
        @blur="handleNameUpdate('email', 'isEditingEmail')"
        @keyup.enter="handleNameUpdate('email', 'isEditingEmail')"
        class="desc"
      ></tiny-input>
    </li>
    <li>
      <span class="title">{{ $t('userInfo.table.department') }}：</span>
      <span 
        v-if="!state.userData.isEditingDepartment" 
        @click="detailClick('isEditingDepartment')"
        class="desc"
      >
        {{ $t(`${state.userData.department}`) }}
      </span>
      <tiny-input
        v-else
        autofocus
        v-model="state.userData.department"
        @blur="handleNameUpdate('department', 'isEditingDepartment')"
        @keyup.enter="handleNameUpdate('department', 'isEditingDepartment')"
        class="desc"
      ></tiny-input>
    </li>
    <li>
      <span class="title">{{ $t('userInfo.table.employeeType') }}：</span>
      <span 
        v-if="!state.userData.isEditingEmployeeType" 
        @click="detailClick('isEditingEmployeeType')"
        class="desc">
        {{ $t(`${state.userData.employeeType}`) }}
      </span>
      <tiny-select
        v-else
        v-model="state.userData.employeeType"
        :placeholder="$t('baseForm.form.label.placeholder')"
        @blur="handleNameUpdate('employeeType', 'isEditingEmployeeType')"
        @keyup.enter="handleNameUpdate('employeeType', 'isEditingEmployeeType')"
        class="desc"
      >
        <tiny-option
          v-for="item in projectData"
          :key="item.value"
          :label="$t(item.label)"
          :value="item.label"
        ></tiny-option>
      </tiny-select>
    </li>
    <li>
      <span class="title">{{ $t('userInfo.table.job') }}：</span>
      <span 
        v-if="!state.userData.isEditingJob"
        @click="detailClick('isEditingJob')"
        class="desc">
        {{ state.userData.role && $t(`${state.userData.role[0].name}`) }}
      </span>
      <tiny-select
        v-else
        v-model="state.userData.roleIds"
        :placeholder="$t('baseForm.form.label.placeholder')"
        @blur="handleNameUpdate('roleIds', 'isEditingJob')"
        @keyup.enter="handleNameUpdate('roleIds', 'isEditingJob')"
        class="desc"
      >
        <tiny-option
          v-for="item in state.roleData"
          :key="item.id"
          :label="$t(item.name)"
          :value="item.id"
        ></tiny-option>
      </tiny-select>
    </li>
    <li>
      <span class="title">{{ $t('userInfo.table.probationStart') }}：</span>
      <span
        v-if="!state.userData.isEditingProbationStart"
        @click="detailClick('isEditingProbationStart')"
        class="desc">
        {{ state.userData.probationStart }}
      </span>
      <tiny-date-picker
        v-else
        v-model="state.userData.probationStart"
        format="yyyy-MM-dd"
        @change="handleNameUpdate('probationStart', 'isEditingProbationStart')"
      ></tiny-date-picker>
    </li>
    <li>
      <span class="title">{{ $t('userInfo.table.probationEnd') }}：</span>
      <span
        v-if="!state.userData.isEditingProbationEnd"
        @click="detailClick('isEditingProbationEnd')"
        class="desc">
        {{ state.userData.probationEnd }}
      </span>
      <tiny-date-picker
        v-else
        v-model="state.userData.probationEnd"
        format="yyyy-MM-dd"
        @change="handleNameUpdate('probationEnd', 'isEditingProbationEnd')"
      ></tiny-date-picker>
    </li>
    <li>
      <span class="title">{{ $t('userInfo.table.probationDuration') }}：</span>
      <span 
        v-if="!state.userData.isEditingProbationDuration"
        @click="detailClick('isEditingProbationDuration')"
        class="desc"
      >
        {{ $t(`${state.userData.probationDuration}`) }}
      </span>
      <tiny-input
        v-else
        autofocus
        v-model="state.userData.probationDuration"
        @blur="handleNameUpdate('probationDuration', 'isEditingProbationDuration')"
        @keyup.enter="handleNameUpdate('probationDuration', 'isEditingProbationDuration')"
        class="desc"
      ></tiny-input>
    </li>
    <li>
      <span class="title">{{ $t('userInfo.table.address') }}：</span>
      <span 
        v-if="!state.userData.isEditingAddress"
        @click="detailClick('isEditingAddress')"
        class="desc"
      >
        {{ $t(`${state.userData.address}`) }}
      </span>
      <tiny-input
        v-else
        autofocus
        v-model="state.userData.address"
        @blur="handleNameUpdate('address', 'isEditingAddress')"
        @keyup.enter="handleNameUpdate('address', 'isEditingAddress')"
        class="desc"
      ></tiny-input>
    </li>
    <li>
      <span class="title">{{ $t('userInfo.table.status') }}：</span>
      <span
        v-if="!state.userData.isEditingStatus"
        @click="detailClick('isEditingStatus')"
        class="desc">
        {{ STATUSDATA[state.userData.status] }}
      </span>
      <tiny-select
        v-else
        v-model="state.userData.status"
        :placeholder="$t('baseForm.form.label.placeholder')"
        @blur="handleNameUpdate('status', 'isEditingStatus')"
        @keyup.enter="handleNameUpdate('status', 'isEditingStatus')"
        class="desc"
      >
        <tiny-option
          v-for="(value, key) in STATUSDATA"
          :key="key"
          :label="$t(value)"
          :value="key"
        ></tiny-option>
      </tiny-select>
    </li>
  </ul>
</template>

<script lang="ts" setup>
  import { onMounted, reactive, defineProps } from 'vue';
  import { useI18n } from 'vue-i18n';
  import {
    Select as TinySelect,
    Option as TinyOption,
    Input as TinyInput,
    DatePicker as TinyDatePicker,
    Modal,
  } from '@opentiny/vue';
  import { getSimpleDate } from '@/utils/time';
  import { getUserInfo, updateUserInfo } from '@/api/user';
  import { getAllRole } from '@/api/role';
  import { useUserStore } from '@/store';
  import { STATUSDATA } from '../const';

  const userStore = useUserStore();

  const props = defineProps({
    email: String
  });
  const emit = defineEmits<{
    cancel: [];
    confirm: [];
  }>();
  // 初始化请求数据
  fetchData(props.email);
  onMounted(() => {
    fetchRole();
  });

  const state = reactive<{
    userData: any;
    backupUserData: any;
    roleData: any;
    editorSwitchList: string[],
  }>({
    userData: {} as any,
    backupUserData: {} as any,
    roleData: [] as any,
    editorSwitchList: [
      'isEditingName',
      'isEditingEmail',
      'isEditingDepartment',
      'isEditingEmployeeType',
      'isEditingJob',
      'isEditingProbationDuration',
      'isEditingAddress',
      'isEditingStatus',
      'isEditingProbationStart',
      'isEditingProbationEnd'
    ] as string[],
  });

  const projectData = [
    {
      value: '1',
      label: 'Social Recruitment',
    },
    {
      value: '2',
      label: 'School Recruitment',
    },
    {
      value: '3',
      label: 'Job Transfer',
    },
  ];

  const { t } = useI18n();

  const detailClick = (attr) => {
    if(attr === 'isEditingStatus') {
      state.userData.status = STATUSDATA[state.userData.status]
    }
    state.editorSwitchList.forEach((item) => {
      if (item === attr) {
        state.userData[item] = true;
      } else {
        state.userData[item] = false;
        const key = item.slice(9).toLocaleLowerCase()
        !state.userData[key] && (state.userData[key] = state.backupUserData[key])
      }
    })
  }

  async function fetchData(email: string) {
    if (email !== undefined || null) {
      const { data } = await getUserInfo(email);
      if (data.role && data.role.length) {
        data.roleIds = data.role[0].id;
        data.roleName = data.role[0].name;
      }
      state.userData = data;
      state.backupUserData = {...data};
      state.userData.probationDate = [data.probationStart, data.probationEnd];
    }
  }

  async function fetchRole() {
    const { data } = await getAllRole();
    state.roleData = data;
  }
  
  // 处理提交
  const handleNameUpdate = async (value, editName) => {
    state.userData[editName] = false
    state.userData.probationStart = getSimpleDate(state.userData.probationStart)
    state.userData.probationEnd = getSimpleDate(state.userData.probationEnd)
    if(!state.userData[value] || state.userData[value] === state.backupUserData[value]) {
      return 
    }

    let data = state.userData;
    let newTemp = {
      email: data.email,
      name: data.name,
      address: data.address,
      department: data.department,
      roleIds: [data.roleIds],
      employeeType: data.employeeType,
      probationStart: data.probationStart,
      probationEnd: data.probationEnd,
      probationDuration: data.probationDuration,
      protocolStart: getSimpleDate(data.protocolStart),
      protocolEnd: getSimpleDate(data.protocolEnd),
      status: data.status,
    };

    try {
      await updateUserInfo(newTemp);
      Modal.message({
        message: t('baseForm.form.submit.success'),
        status: 'success',
      });
      if (state.userData.email === userStore.email) {
        const { data: userInfo = null } = await getUserInfo();
        userStore.setInfo(userInfo);
      }
      emit('confirm', value, state.userData[value]);
    } catch (error) {
      if (error.response && error.response.data) {
        const errorMessage = error.response.data.message || '未知错误';
        Modal.message({
          message: errorMessage,
          status: 'error',
        });
      }
    }
  };
</script>

<style scoped lang="less">
.tiny-info-expand {
  display: flex;
  flex-wrap: wrap;
  list-style-type: none;
  padding: 0;

  li {
    width: calc(16.666% - 10px); // 一行显示6个li，留出间距
    margin: 5px;
    line-height: 1.5;

    span {
      display: block;
    }

    .title {
      color: rgb(128, 128, 128);
    }

    .desc {
      margin-top: 8px;
      white-space: normal;
      word-break: break-word;
    }
  }

  // 给第七个往后的li增加margin-top:16px;
  li:nth-child(n+7) {
    margin-top: 16px;
  }
}
</style>
