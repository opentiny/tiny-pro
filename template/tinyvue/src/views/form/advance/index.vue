<template lang="">
  <div class="container-list">
    <Breadcrumb :items="['menu.form', 'menu.form.advance']" />
    <div id="content-container">
      <div class="content">
        <div class="header mb-4">{{
          $t('advanceForm.form.basicInfo.title')
        }}</div>
        <basic-info ref="basicInfoRef" :project-data="projectData"></basic-info>
      </div>
      <div class="content">
        <div class="header mb-4">{{
          $t('advanceForm.form.process.title')
        }}</div>
        <process-grid
          ref="processGrid"
          :options="processOptions"
        ></process-grid>
      </div>

      <div class="footer">
        <tiny-button @click="handleFormReset">
          {{ $t('stepForm.button.restore') }}
        </tiny-button>
        <tiny-button
          type="primary"
          native-type="submit"
          @click="handleSubmit"
          >{{ $t('stepForm.button.submit') }}</tiny-button
        >
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { t } from '@opentiny/vue-locale';
  import { ref, reactive, onMounted } from 'vue';
  import { TinyButton, Modal, Loading } from '@opentiny/vue';
  import { getAdvanceData } from '@/api/form';
  import BasicInfo from './basic-info/index.vue';
  import ProcessGrid from './process-grid/index.vue';

  let loadingState = ref(null);

  const basicInfoRef = ref();

  const processGrid = ref();

  const projectData = reactive({
    positionOptions: [],
    hrOptions: [],
    teacherOptions: [],
  });

  const processOptions = reactive({
    status: [],
    department: [],
  });

  onMounted(() => {
    fetchData();
  });

  const handleFormReset = () => {
    basicInfoRef.value?.resetForm();
    processGrid.value?.resetGrid();
  };

  const handleSubmit = () => {
    const baseValid = basicInfoRef.value.validForm();
    if (baseValid) {
      Modal.message({
        message: t('baseForm.form.submit.success'),
        status: 'success',
      });
    }
  };

  // 请求数据接口方法
  const fetchData = async () => {
    loadingState.value = Loading.service({
      text: 'loading...',
      target: document.getElementById('content-container'),
      background: 'rgba(0, 0, 0, 0.7)',
    });
    try {
      const { data } = await getAdvanceData();
      projectData.positionOptions = data.position;
      projectData.hrOptions = data.HR;
      projectData.teacherOptions = data.mentor.map((item) => ({
        label: item,
        value: item,
      }));
      processOptions.status = data.status.map((item) => ({
        label: item,
        value: item,
      }));
      processOptions.department = data.department;
    } finally {
      loadingState.value.close();
    }
  };
</script>
<style scoped lang="less">
  .container-list {
    flex: 1 1 auto;
    flex-direction: column;
    justify-content: space-between;
    overflow-x: hidden;
    overflow-y: auto;
  }

  #content-container {
    height: calc(100% - 53px); // 53px is the height of breadcrumb
    overflow: auto;
  }

  .content {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    background: #fff;
    border-radius: 10px;
    padding: 20px;
    margin-bottom: 20px;
  }

  .footer {
    display: flex;
    overflow: auto;
    background: #fff;
    border-radius: 10px;
    padding: 20px;
  }

  .header {
    color: var(--tv-color-text);
    font-weight: bold;
    font-size: 16px;
  }
</style>
