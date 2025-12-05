<template>
  <div id="project-form">
    <tiny-form
      ref="formRef"
      class="form-container"
      label-position="top"
      :model="basicInfo"
      :rules="rules"
      :validate-type="validType"
    >
      <!-- 项目名称 -->
      <tiny-form-item
        :label="$t('advanceForm.form.basicInfo.projectName')"
        prop="projectName"
      >
        <tiny-input v-model="basicInfo.projectName"></tiny-input>
      </tiny-form-item>
      <!-- 培养职位 -->
      <tiny-form-item
        :label="$t('advanceForm.form.basicInfo.position')"
        prop="position"
      >
        <tiny-select
          v-model="basicInfo.position"
          :options="projectData.positionOptions"
        ></tiny-select>
      </tiny-form-item>
      <!-- HR -->
      <tiny-form-item :label="$t('advanceForm.form.basicInfo.hr')" prop="hr">
        <tiny-select
          v-model="basicInfo.hr"
          :options="projectData.hrOptions"
        ></tiny-select>
      </tiny-form-item>
      <!-- 导师 -->
      <tiny-form-item
        :label="$t('advanceForm.form.basicInfo.teacher')"
        prop="teacher"
      >
        <tiny-select
          v-model="basicInfo.teacher"
          :options="projectData.teacherOptions"
        ></tiny-select>
      </tiny-form-item>
      <!-- 开始时间 -->
      <tiny-form-item
        :label="$t('advanceForm.form.basicInfo.startTime')"
        prop="startTime"
      >
        <tiny-date-picker v-model="basicInfo.startTime"></tiny-date-picker>
      </tiny-form-item>
      <!-- 结束时间 -->
      <tiny-form-item
        :label="$t('advanceForm.form.basicInfo.endTime')"
        prop="endTime"
      >
        <tiny-date-picker v-model="basicInfo.endTime"></tiny-date-picker>
      </tiny-form-item>
      <!-- 电话 -->
      <tiny-form-item
        :label="$t('advanceForm.form.basicInfo.phone')"
        prop="phone"
      >
        <tiny-input v-model="basicInfo.phone"></tiny-input>
      </tiny-form-item>
      <!-- 地址 -->
      <tiny-form-item
        :label="$t('advanceForm.form.basicInfo.address')"
        prop="address"
      >
        <tiny-input v-model="basicInfo.address"></tiny-input
      ></tiny-form-item>
      <!-- 备注 -->
      <tiny-form-item
        :label="$t('advanceForm.form.basicInfo.remark')"
        prop="remark"
      >
        <tiny-input v-model="basicInfo.remark"></tiny-input
      ></tiny-form-item>
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

  defineProps({
    projectData: {
      type: { positionOptions: [], hrOptions: [], teacherOptions: [] },
      default: {},
    },
  });

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

  defineExpose({
    validForm,
    resetForm,
  });
</script>
<style scoped lang="less">
  .form-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(310px, 1fr));
    gap: 10%;
    row-gap: 12px;
  }
</style>
