<template lang="">
  <div class="container-list">
    <Breadcrumb :items="['menu.form', 'menu.form.advance']" />
    <div class="content-container">
      <div class="content">
        <div class="header mb-4">{{
          $t('advanceForm.form.basicInfo.title')
        }}</div>
        <BasicInfo ref="basicInfoRef"></BasicInfo>
      </div>
      <div class="content">
        <div class="header mb-4">{{
          $t('advanceForm.form.process.title')
        }}</div>
        <ProcessGrid ref="processGrid"></ProcessGrid>
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
<script setup>
  import { t } from '@opentiny/vue-locale';
  import { ref } from 'vue';
  import { TinyButton, Modal } from '@opentiny/vue';
  import BasicInfo from './basic-info/index.vue';
  import ProcessGrid from './process-grid/index.vue';

  const basicInfoRef = ref();

  const processGrid = ref();

  const handleFormReset = () => {
    basicInfoRef.value.resetForm();
    processGrid.value.resetGrid();
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
</script>
<style scoped lang="less">
  .container-list {
    flex: 1 1 auto;
    flex-direction: column;
    justify-content: space-between;
    overflow-x: hidden;
    overflow-y: auto;
  }

  .content-container {
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
