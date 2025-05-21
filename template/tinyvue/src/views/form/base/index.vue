<template>
  <div class="container-form">
    <div class="container-header">{{ $t('menu.form.base') }}</div>
    <div class="base-body">
      <div class="form-card">
        <base-info
          ref="baseInfoFormRef"
          :project-data="projectData"
          :coach-play="coachPlay"
        ></base-info>
      </div>
      <div class="form-card mart_16">
        <detail-info ref="detailInfoFormRef"></detail-info>
      </div>
      <div class="base-footer mart_16">
        <tiny-button @click="handleFormReset">
          {{ $t('baseForm.form.cancel') }}
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
  import { ref, reactive, onBeforeMount } from 'vue';
  import { useI18n } from 'vue-i18n';
  import {
    Collapse as TinyCollapse,
    CollapseItem as TinyCollapseItem,
    Button as TinyButton,
    ScrollText as TinyScrollText,
    Loading,
    Modal,
  } from '@opentiny/vue';
  import { IconInfoCircle } from '@opentiny/vue-icon';
  import { getBaseData } from '@/api/form';
  import transitionFadeSlideGroup from '@/components/transition/transition-fade-slide-group.vue';
  import BaseInfo from './components/base-info.vue';
  import DetailInfo from './components/detail-info.vue';
  // 加载效果
  const state = reactive<{
    loading: any;
  }>({
    loading: null,
  });

  // 初始化请求数据
  const { t } = useI18n();
  const baseInfoFormRef = ref(null);
  const detailInfoFormRef = ref(null);

  const coachPlay = ref(true);
  const planVis = ref(true);
  const projectData = reactive({
    position: [],
    HR: [],
    mentor: [],
    director: [],
  });

  // 请求数据接口方法
  const fetchData = async () => {
    state.loading = Loading.service({
      text: 'loading...',
      target: document.getElementById('container'),
      background: 'rgba(0, 0, 0, 0.7)',
    });
    try {
      const { data } = await getBaseData();
      projectData.position = data.position;
      projectData.HR = data.HR;
      projectData.mentor = data.mentor;
      projectData.director = data.director;
    } finally {
      state.loading.close();
    }
  };

  // 初始化请求数据
  onBeforeMount(() => {
    fetchData();
  });

  // form的button
  function handleFormReset() {
    baseInfoFormRef.value.peopleReset();
    detailInfoFormRef.value.planReset();
  }

  function handleSubmit() {
    const baseValid = baseInfoFormRef.value.baseValid();
    if (baseValid) {
      Modal.message({
        message: t('baseForm.form.submit.success'),
        status: 'success',
      });
    } else {
      Modal.message({
        message: t('baseForm.form.submit.error'),
        status: 'error',
      });
    }
  }
</script>

<style scoped lang="less"></style>
