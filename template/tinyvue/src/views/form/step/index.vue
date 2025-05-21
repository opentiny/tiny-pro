<template>
  <div class="container-form">
    <div class="container-header">{{ $t('menu.form.step') }}</div>

    <div class="base-body">
      <transition-fade-slide-group>
        <div class="form-card">
          <div class="form-header">{{ $t('stepForm.coaching.process') }}</div>
          <div>
            <tiny-time-line
              :data="[
                { name: t('stepForm.start.coaching') },
                { name: t('stepForm.immediate.supervisor') },
                { name: t('stepForm.overall.goals') },
                { name: t('stepForm.overall.summary') },
                { name: t('stepForm.overall.end') },
              ]"
              :active="normalActive"
              space="200"
              type="normal"
              :class="`${loacle}-line`"
            ></tiny-time-line>
          </div>
        </div>

        <div class="form-card mart_16 form-scroll">
          <collapse-form ref="collapseRef"></collapse-form>
        </div>
        <div class="base-footer mart_16">
          <tiny-button v-if="normalActive !== 4" @click="handleFormReset">{{
            $t('stepForm.button.cancel')
          }}</tiny-button>
          <tiny-button
            v-if="normalActive !== 4"
            type="primary"
            native-type="submit"
            @click="handleSubmit"
            >{{ $t('stepForm.button.next') }}</tiny-button
          >
          <tiny-button v-if="normalActive === 4" @click="handleFormRestore">{{
            $t('stepForm.button.restore')
          }}</tiny-button>
        </div>
      </transition-fade-slide-group>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { computed, ref } from 'vue';
  import { useI18n } from 'vue-i18n';
  import {
    TimeLine as TinyTimeLine,
    Button as TinyButton,
  } from '@opentiny/vue';
  import { useAppStore } from '@/store';
  import transitionFadeSlideGroup from '@/components/transition/transition-fade-slide-group.vue';
  import CollapseForm from './components/collapse-form.vue';
  import CoacheForm from './components/coach-form.vue';

  const { t } = useI18n();
  const appStore = useAppStore();
  const collapseRef = ref();
  const normalActive = computed(() => appStore.step);
  const loacle = computed(() => localStorage.getItem('tiny-locale'));
  // btn操作
  function handleFormReset() {
    collapseRef.value.collapseReset();
  }

  function handleSubmit() {
    collapseRef.value.collapseSubmit();
  }

  function handleFormRestore() {
    collapseRef.value.collapseRestore();
  }
</script>

<style scoped lang="less">
  .form-card {
    padding: 24px 14px;
  }

  :deep(.enUS-line) {
    .tiny-steps-normal.text-bottom {
      margin-left: -45px;
    }
  }
  :deep(.zhCN-line) {
    .tiny-steps-normal.text-bottom {
      margin-left: -58px;
    }
  }
  .form-scroll {
    height: calc(100% - 275px);
    overflow: auto;
  }
</style>
