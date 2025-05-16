<template>
  <div class="mentor-detail">
    <div class="detail-header">{{ $t('baseForm.form.label.mentortitle') }}</div>
    <tiny-row :flex="true" class="detail-row" noSpace>
      <tiny-col :span="3">
        <div class="title pad-title">
          {{ $t('menu.plan.pool') }}
        </div>
        <div class="content pad-title">
          {{ $t('menu.plan.no') }}
        </div>
      </tiny-col>
    </tiny-row>
  </div>
</template>

<script lang="ts" setup>
  import { Row as TinyRow, Col as TinyCol } from '@opentiny/vue';
</script>

<style scoped lang="less"></style>
