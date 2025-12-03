<template>
  <div id="project-form">
    <tiny-form
      ref="formRef"
      label-position="top"
      :model="basicInfo"
      :rules="rules"
      :validate-type="validType"
    >
      <tiny-row>
        <tiny-col :span="4">
          <tiny-form-item
            :label="$t('advanceForm.form.basicInfo.projectName')"
            prop="projectName"
          >
            <tiny-input v-model="basicInfo.projectName"></tiny-input>
          </tiny-form-item>
        </tiny-col>
        <tiny-col :span="4">
          <tiny-form-item
            :label="$t('advanceForm.form.basicInfo.position')"
            prop="position"
          >
            <tiny-select
              v-model="basicInfo.position"
              :options="projectData.positionOptions"
            ></tiny-select>
          </tiny-form-item>
        </tiny-col>
        <tiny-col :span="4">
          <tiny-form-item
            :label="$t('advanceForm.form.basicInfo.hr')"
            prop="hr"
          >
            <tiny-select
              v-model="basicInfo.hr"
              :options="projectData.hrOptions"
            ></tiny-select>
          </tiny-form-item>
        </tiny-col>
      </tiny-row>
      <tiny-row>
        <tiny-col :span="4">
          <tiny-form-item
            :label="$t('advanceForm.form.basicInfo.teacher')"
            prop="teacher"
          >
            <tiny-select
              v-model="basicInfo.teacher"
              :options="projectData.teacherOptions"
            ></tiny-select>
          </tiny-form-item>
        </tiny-col>
        <tiny-col :span="4">
          <tiny-form-item
            :label="$t('advanceForm.form.basicInfo.startTime')"
            prop="startTime"
          >
            <tiny-date-picker v-model="basicInfo.startTime"></tiny-date-picker>
          </tiny-form-item>
        </tiny-col>
        <tiny-col :span="4">
          <tiny-form-item
            :label="$t('advanceForm.form.basicInfo.endTime')"
            prop="endTime"
          >
            <tiny-date-picker v-model="basicInfo.endTime"></tiny-date-picker>
          </tiny-form-item>
        </tiny-col>
      </tiny-row>
      <tiny-row>
        <tiny-col :span="4">
          <tiny-form-item
            :label="$t('advanceForm.form.basicInfo.phone')"
            prop="phone"
          >
            <tiny-input v-model="basicInfo.phone"></tiny-input>
          </tiny-form-item>
        </tiny-col>
        <tiny-col :span="4">
          <tiny-form-item
            :label="$t('advanceForm.form.basicInfo.address')"
            prop="address"
          >
            <tiny-input v-model="basicInfo.address"></tiny-input
          ></tiny-form-item>
        </tiny-col>
        <tiny-col :span="4">
          <tiny-form-item
            :label="$t('advanceForm.form.basicInfo.remark')"
            prop="remark"
          >
            <tiny-input v-model="basicInfo.remark"></tiny-input
          ></tiny-form-item>
        </tiny-col>
      </tiny-row>
    </tiny-form>
  </div>
</template>
<script setup>
  import {
    TinyForm,
    TinyInput,
    TinyFormItem,
    TinyRow,
    TinyCol,
    TinySelect,
    TinyDatePicker,
    TinyGrid,
    TinyGridColumn,
    TinyButton,
    TinyTimeSelect,
    Loading,
    Modal,
  } from '@opentiny/vue';
  import { ref, reactive, onMounted } from 'vue';
  import { t } from '@opentiny/vue-locale';
  import { getBaseData } from '@/api/form';

  const formRef = ref();

  const basicInfo = reactive({
    projectName: '',
    position: '',
    hr: '',
    teacher: '',
    startTime: '',
    endTime: '',
    phone: '',
    address: '',
    remark: '',
  });
  const validType = ref('text');
  let loadingState = ref(null);
  const projectData = reactive({
    positionOptions: [],
    hrOptions: [],
    teacherOptions: [],
  });

  const commonRule = [
    {
      required: true,
      trigger: ['blur', 'change'],
      message: t('advanceForm.form.validError.null'),
    },
  ];
  const rules = ref({
    projectName: [...commonRule],
    position: [...commonRule],
    hr: [...commonRule],
    teacher: [...commonRule],
    startTime: [...commonRule],
    endTime: [...commonRule],
    phone: [...commonRule],
    address: [...commonRule],
    remark: [...commonRule],
  });

  onMounted(() => {
    fetchData();
  });

  const validForm = () => {
    let baseValidate = false;
    formRef.value.validate((valid) => {
      if (!valid) {
        Modal.message({
          message: t('baseForm.form.submit.error'),
          status: 'error',
        });
      }
      baseValidate = valid;
    });

    return baseValidate;
  };

  const resetForm = () => {
    formRef.value.resetFields();
  };

  // 请求数据接口方法
  const fetchData = async () => {
    loadingState.value = Loading.service({
      text: 'loading...',
      target: document.getElementById('project-form'),
      background: 'rgba(0, 0, 0, 0.7)',
    });
    try {
      const { data } = await getBaseData();
      projectData.positionOptions = data.position;
      projectData.hrOptions = data.HR;
      projectData.teacherOptions = data.mentor.map((item) => ({
        label: item,
        value: item,
      }));
    } finally {
      loadingState.value.close();
    }
  };

  defineExpose({
    validForm,
    resetForm,
  });
</script>
<style scoped lang="less"></style>
