<template>
  <tiny-layout>
    <tiny-form
      ref="baseFormRef"
      :model="state.filterOptions"
      :rules="rules"
      :label-align="true"
      label-position="top"
      class="form-base-info"
    >
      <div class="form-header">{{ $t('stepForm.collapse.base') }}</div>
      <tiny-row :flex="true">
        <transition-fade-down-group>
          <tiny-col :span="4">
            <tiny-form-item :label="$t('stepForm.coach.culture')" prop="sector">
              <tiny-input
                v-model="state.filterOptions.sector"
                :disabled="disabled"
                :placeholder="$t('searchTable.form.input')"
              ></tiny-input>
            </tiny-form-item>
          </tiny-col>
          <tiny-col :span="4">
            <tiny-form-item
              :label="$t('stepForm.coach.position')"
              prop="position"
            >
              <tiny-select
                v-model="state.filterOptions.position"
                :disabled="disabled"
                :placeholder="$t('baseForm.form.label.placeholder')"
                multiple
              >
                <tiny-option
                  v-for="item in projectData?.position as any"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></tiny-option>
              </tiny-select>
            </tiny-form-item>
          </tiny-col>
          <tiny-col :span="4">
            <tiny-form-item label="HR" prop="hr">
              <tiny-select
                v-model="state.filterOptions.hr"
                :disabled="disabled"
                :placeholder="$t('baseForm.form.label.placeholder')"
                multiple
              >
                <tiny-option
                  v-for="item in projectData?.HR as any"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></tiny-option>
              </tiny-select>
            </tiny-form-item>
          </tiny-col>
        </transition-fade-down-group>
      </tiny-row>

      <tiny-row :flex="true">
        <transition-fade-down-group>
          <tiny-col :span="4">
            <tiny-form-item :label="$t('stepForm.coach.mentor')" prop="teacher">
              <tiny-select
                v-model="state.filterOptions.teacher"
                :disabled="disabled"
                :placeholder="$t('baseForm.form.label.placeholder')"
                multiple
              >
                <tiny-option
                  v-for="item in projectData?.mentor as any"
                  :key="item"
                  :label="item"
                  :value="item"
                ></tiny-option>
              </tiny-select>
            </tiny-form-item>
          </tiny-col>
          <tiny-col :span="4">
            <tiny-form-item
              :label="$t('stepForm.coach.startTime')"
              prop="startTime"
            >
              <tiny-date-picker
                v-model="state.filterOptions.startTime"
                :disabled="disabled"
                :placeholder="$t('searchTable.form.input')"
              ></tiny-date-picker>
            </tiny-form-item>
          </tiny-col>
          <tiny-col :span="4">
            <tiny-form-item
              :label="$t('stepForm.coach.endTime')"
              prop="endTime"
            >
              <tiny-date-picker
                v-model="state.filterOptions.endTime"
                :disabled="disabled"
                :placeholder="$t('searchTable.form.input')"
                @blur="handleBlur"
              ></tiny-date-picker>
            </tiny-form-item>
          </tiny-col>
        </transition-fade-down-group>
      </tiny-row>
    </tiny-form>
  </tiny-layout>
</template>

<script lang="ts" setup>
  import {
    ref,
    reactive,
    defineProps,
    computed,
    defineExpose,
    toRefs,
  } from 'vue';
  import { useI18n } from 'vue-i18n';
  import {
    Select as TinySelect,
    Option as TinyOption,
    Layout as TinyLayout,
    Form as TinyForm,
    FormItem as TinyFormItem,
    Row as TinyRow,
    Col as TinyCol,
    Input as TinyInput,
    DatePicker as TinyDatePicker,
    Modal,
  } from '@opentiny/vue';

  interface FilterOptions {
    sector: string;
    position: Array<object>;
    hr: string;
    teacher: Array<object>;
    startTime: string;
    endTime: string;
  }

  // 父组件传值
  const props = defineProps({
    projectData: Object,
    coachPlay: Boolean,
  });

  const { coachPlay } = toRefs(props);

  // 加载效果
  const state = reactive<{
    filterOptions: FilterOptions;
  }>({
    filterOptions: {} as FilterOptions,
  });

  // 初始化请求数据
  const { t } = useI18n();
  const baseFormRef = ref();
  const disabled = ref(false);

  const handleBlur = () => {
    const start = state.filterOptions.startTime
      ? new Date(
          JSON.parse(JSON.stringify(state.filterOptions.startTime)),
        )?.getTime()
      : '';
    const end = state.filterOptions.endTime
      ? new Date(
          JSON.parse(JSON.stringify(state.filterOptions.endTime)),
        ).getTime()
      : '';
    if (end < start) {
      Modal.message({
        message: t('userInfo.time.message'),
        status: 'error',
      });
      state.filterOptions.endTime = '';
    }
  };

  // 校验规则
  const rulesType = {
    required: true,
    trigger: ['blur', 'change'],
  };
  const rulesSelect = {
    required: true,
    message: '必选',
    trigger: ['blur', 'change'],
  };

  const rules = computed(() => {
    return {
      sector: coachPlay.value ? [rulesType] : '',
      position: coachPlay.value ? [rulesSelect] : '',
      hr: coachPlay.value ? [rulesSelect] : '',
      teacher: coachPlay.value ? [rulesSelect] : '',
      startTime: coachPlay.value ? [rulesType] : '',
      endTime: coachPlay.value ? [rulesType] : '',
    };
  });

  const baseValid = () => {
    let baseValidate = false;
    baseFormRef.value.validate((valid: boolean) => {
      if (valid) {
        disabled.value = true;
      }
      baseValidate = valid;
    });

    return baseValidate;
  };

  const baseReset = () => {
    disabled.value = false;
    state.filterOptions = {} as FilterOptions;
  };

  defineExpose({
    baseValid,
    baseReset,
  });
</script>

<style scoped lang="less"></style>
