<template>
  <div class="target-detail">
    <div class="detail-header">{{ $t('baseForm.form.label.Objectives') }}</div>

    <tiny-row :flex="true" class="detail-row" noSpace>
      <tiny-col :span="3">
        <div class="title pad-title">
          {{ $t('menu.plan.develop') }}
        </div>
        <div class="content pad-title">
          {{ $t('menu.plan.yes') }}
        </div>
      </tiny-col>
      <tiny-col :span="3">
        <div class="title pad-title">
          {{ $t('menu.plan.role') }}
        </div>
        <div class="content">
          {{ $t('menu.plan.mentor') }}
        </div>
      </tiny-col>
      <tiny-col :span="3">
        <div class="title pad-title">
          {{ $t('menu.plan.condition') }}
        </div>
        <div class="content pad-title"> {{ $t('menu.plan.approval') }} </div>
      </tiny-col>
    </tiny-row>
  </div>
</template>

<script lang="ts" setup>
  import { Row as TinyRow, Col as TinyCol, TinyPager } from '@opentiny/vue';
</script>

<style scoped lang="less"></style>
