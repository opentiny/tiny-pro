<script lang="ts" setup>
import { Col as TinyCol, Row as TinyRow } from '@opentiny/vue'
</script>

<template>
  <div class="mentor-detail">
    <div class="detail-header">
      {{ $t('baseForm.form.label.mentortitle') }}
    </div>
    <TinyRow class="detail-row flex flex-wrap" no-space>
      <TinyCol class="w-1/4 max-md:w-1/2 max-sm:w-full">
        <div class="title pad-title">
          {{ $t('menu.plan.pool') }}
        </div>
        <div class="content pad-title">
          {{ $t('menu.plan.no') }}
        </div>
      </TinyCol>
    </TinyRow>
  </div>
</template>

<style scoped lang="less"></style>
