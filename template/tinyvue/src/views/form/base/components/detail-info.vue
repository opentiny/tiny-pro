<template>
  <tiny-layout>
    <tiny-form
      ref="coachFormRef"
      :model="state.filterOptions"
      :label-align="true"
      label-position="top"
    >
      <div class="form-header">{{ $t('baseForm.form.title.detail') }}</div>
      <tiny-row>
        <transition-fade-down-group>
          <tiny-col :span="12">
            <tiny-form-item
              :label="$t('baseForm.form.label.culture')"
              prop="culture"
            >
              <div>
                <tiny-radio v-model="filterOptions.culture" label="1">{{
                  $t('baseForm.form.label.yes')
                }}</tiny-radio>
                <tiny-radio v-model="filterOptions.culture" label="2">{{
                  $t('baseForm.form.label.no')
                }}</tiny-radio>
              </div>
            </tiny-form-item>
          </tiny-col>
          <tiny-col :span="12">
            <tiny-form-item :label="$t('baseForm.form.label.role')" prop="role">
              <div>
                <tiny-radio v-model="filterOptions.role" label="1">{{
                  $t('baseForm.form.label.roleone')
                }}</tiny-radio>
                <tiny-radio v-model="filterOptions.role" label="2">{{
                  $t('baseForm.form.label.roletwo')
                }}</tiny-radio>
              </div>
            </tiny-form-item>
          </tiny-col>
          <tiny-col :span="12">
            <tiny-form-item
              :label="$t('baseForm.form.label.condition')"
              prop="condition"
            >
              <div>
                <tiny-radio v-model="filterOptions.condition" label="1">{{
                  $t('baseForm.form.label.conditionone')
                }}</tiny-radio>
                <tiny-radio v-model="filterOptions.condition" label="2">{{
                  $t('baseForm.form.label.conditiontwo')
                }}</tiny-radio>
                <tiny-radio v-model="filterOptions.condition" label="3">{{
                  $t('baseForm.form.label.conditionthree')
                }}</tiny-radio>
                <tiny-radio v-model="filterOptions.condition" label="4">{{
                  $t('baseForm.form.label.conditionfour')
                }}</tiny-radio>
              </div>
            </tiny-form-item>
          </tiny-col>
          <tiny-col :span="12">
            <tiny-form-item
              :label="$t('baseForm.form.label.remark')"
              prop="condition"
            >
              <tiny-input
                type="textarea"
                v-model="filterOptions.remark"
                class="remarks"
                :placeholder="$t('searchTable.form.input')"
                show-word-limit
                :maxlength="1000"
              ></tiny-input>
            </tiny-form-item>
          </tiny-col>
        </transition-fade-down-group>
      </tiny-row>
    </tiny-form>
  </tiny-layout>
</template>

<script lang="ts" setup>
  import { reactive, toRefs, defineExpose } from 'vue';
  import {
    Layout as TinyLayout,
    Form as TinyForm,
    FormItem as TinyFormItem,
    Row as TinyRow,
    Col as TinyCol,
    Radio as TinyRadio,
    Input as TinyInput,
  } from '@opentiny/vue';

  interface FilterOptions {
    culture: string;
    role: string;
    condition: string;
    remark: string;
  }

  // 加载效果
  const state = reactive<{
    filterOptions: FilterOptions;
  }>({
    filterOptions: {
      culture: '1',
      role: '1',
      condition: '1',
      remark: '',
    } as FilterOptions,
  });
  const { filterOptions } = toRefs(state);

  const objectiveReset = () => {
    state.filterOptions = {
      culture: '1',
      role: '1',
      condition: '1',
      remark: '',
    } as FilterOptions;
  };

  defineExpose({
    objectiveReset,
  });
</script>

<style scoped lang="less">
  .remarks {
    width: 500px;
  }
</style>
