<script lang="ts" setup>
import { Col as TinyCol, Row as TinyRow } from '@opentiny/vue'
</script>

<template>
  <div class="whole-detail">
    <div class="detail-header">
      {{ $t('baseForm.form.label.evaluation') }}
    </div>
    <TinyRow class="detail-row flex flex-wrap" no-space>
      <TinyCol class="w-1/4 max-md:w-1/2 max-sm:w-full">
        <div class="title pad-title">
          {{ $t('menu.plan.develop') }}
        </div>
        <div class="content pad-title">
          {{ $t('menu.plan.yes') }}
        </div>
      </TinyCol>
      <TinyCol class="w-1/4 max-md:w-1/2 max-sm:w-full">
        <div class="title pad-title">
          {{ $t('menu.plan.whole') }}
        </div>
        <div class="content">
          {{ $t('menu.plan.evaluation') }}
        </div>
      </TinyCol>
    </TinyRow>
  </div>
</template>

<style scoped lang="less"></style>
