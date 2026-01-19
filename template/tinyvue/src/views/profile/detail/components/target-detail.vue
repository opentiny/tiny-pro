<script lang="ts" setup>
import { Col as TinyCol, Row as TinyRow } from '@opentiny/vue'
</script>

<template>
  <div class="target-detail">
    <div class="detail-header">
      {{ $t('baseForm.form.label.Objectives') }}
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
          {{ $t('menu.plan.role') }}
        </div>
        <div class="content">
          {{ $t('menu.plan.mentor') }}
        </div>
      </TinyCol>
      <TinyCol class="w-1/4 max-md:w-1/2 max-sm:w-full">
        <div class="title pad-title">
          {{ $t('menu.plan.condition') }}
        </div>
        <div class="content pad-title">
          {{ $t('menu.plan.approval') }}
        </div>
      </TinyCol>
    </TinyRow>
  </div>
</template>

<style scoped lang="less"></style>
