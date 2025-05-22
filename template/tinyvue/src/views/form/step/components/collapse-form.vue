<template>
  <div class="container-form">
    <transition-fade-down-group>
      <div>
        <div class="form-header">{{ $t('stepForm.collapse.base') }}</div>
        <coach-form
          ref="coachFormRef"
          :project-data="projectData"
          :coach-play="coachPlay"
        ></coach-form>
      </div>
      <div v-if="directorVis">
        <transition-slide-group>
          <div class="form-header">{{
            $t('stepForm.collapse.supervisor')
          }}</div>
          <director-form
            ref="directorRef"
            :project-data="projectData"
            :director-play="directorPlay"
          ></director-form>
        </transition-slide-group>
      </div>
      <div v-if="targetVis" class="targetStyle">
        <transition-slide-group>
          <div class="form-header">{{ $t('stepForm.collapse.goals') }}</div>
          <target-form ref="targetRef" :project-data="projectData"></target-form>
        </transition-slide-group>
      </div>
      <div v-if="summationVis">
        <transition-slide-group>
          <div class="form-header">{{ $t('stepForm.collapse.summary') }}</div>
          <summation-form
            ref="summationRef"
            :project-data="projectData"
            :summation-play="summationPlay"
          ></summation-form>
        </transition-slide-group>
      </div>
    </transition-fade-down-group>
  </div>
</template>

<script lang="ts" setup>
  import { ref, reactive, onMounted, watch, defineExpose } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { Modal, Loading } from '@opentiny/vue';
  import { useAppStore } from '@/store';
  import { getStepData } from '@/api/form';
  import CoachForm from './coach-form.vue';
  import DirectorForm from './director-form.vue';
  import TargetForm from './target-form.vue';
  import SummationForm from './summation-form.vue';

  // 加载效果
  const state = reactive<{
    loading: any;
  }>({
    loading: null,
  });

  // 初始化请求数据
  const { t } = useI18n();
  const appStore = useAppStore();
  const coachFormRef = ref();
  const directorRef = ref();
  const targetRef = ref();
  const summationRef = ref();
  const directorVis = ref(false);
  const targetVis = ref(false);
  const summationVis = ref(false);
  const coachPlay = ref(true);
  const directorPlay = ref(true);
  const summationPlay = ref(true);
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
      const { data } = await getStepData();
      projectData.position = data.position;
      projectData.HR = data.HR;
      projectData.mentor = data.mentor;
      projectData.director = data.director;
    } finally {
      state.loading.close();
    }
  };

  // 初始化请求数据
  onMounted(() => {
    fetchData();
  });

  // watch控制显隐
  watch(
    appStore.$state,
    (newValue) => {
      if (newValue.step >= 1) {
        directorVis.value = true;
      }
      if (newValue.step >= 2) {
        targetVis.value = true;
      }
      if (newValue.step >= 3) {
        summationVis.value = true;
      }
    },
    { immediate: true },
  );

  // 重置操作
  const collapseReset = () => {
    if (appStore.step === 0) {
      coachFormRef.value.coachReset();
    } else if (appStore.step === 1) {
      directorRef.value.directorReset();
    } else if (appStore.step === 2) {
      targetRef.value.targetReset();
    } else if (appStore.step === 3) {
      summationRef.value.summarizeReset();
    }
  };

  const packaged = (vaild: boolean, index: number, key: string) => {
    if (vaild) {
      Modal.message({
        message: t('baseForm.form.submit.success'),
        status: 'success',
      });
      appStore.updateStep(index);
    } else {
      Modal.message({
        message:
          index !== 3
            ? t('baseForm.form.submit.error')
            : t('stepForm.error.target'),
        status: 'error',
      });
    }
  };

  const collapseSubmit = () => {
    if (appStore.step === 0) {
      const vaild = coachFormRef.value.coachValid();
      packaged(vaild, 1, '2');
    } else if (appStore.step === 1) {
      const vaild = directorRef.value.directorValid();
      packaged(vaild, 2, '3');
    } else if (appStore.step === 2) {
      const vaild = targetRef.value.targetSubmit();
      packaged(vaild, 3, '4');
    } else if (appStore.step === 3) {
      const vaild = summationRef.value.summarizeValid();
      packaged(vaild, 4, '4');
    }
  };

  const collapseRestore = () => {
    appStore.updateStep(0);
    coachFormRef.value.coachReset();
    directorRef.value.directorReset();
    targetRef.value.targetReset();
    summationRef.value.summarizeReset();
    directorVis.value = false;
    targetVis.value = false;
    summationVis.value = false;
  };

  defineExpose({
    collapseReset,
    collapseSubmit,
    collapseRestore,
  });
</script>

<style scoped lang="less"></style>
