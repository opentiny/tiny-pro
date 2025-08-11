<template>
  <div class="mentor-detail">
    <div class="detail-header">{{ $t('baseForm.form.label.mentortitle') }}</div>
    <tiny-row class="flex flex-wrap detail-row" noSpace>
      <tiny-col class="w-1/4 max-md:w-1/2 max-sm:w-full">
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
