<script lang="ts" setup>
import { Col as TinyCol, Row as TinyRow } from '@opentiny/vue'
</script>

<template>
  <div class="plan-detail">
    <div class="detail-header">
      {{ $t('baseForm.form.label.people') }}
    </div>
    <TinyRow class="detail-row flex flex-wrap" no-space>
      <TinyCol class="w-1/4 max-md:w-1/2 max-sm:w-full">
        <div class="title pad-title">
          {{ $t('baseForm.form.project') }}
        </div>
        <div class="content pad-title">
          {{ $t('work.mock.centralized') }}
        </div>
      </TinyCol>
      <TinyCol class="w-1/4 max-md:w-1/2 max-sm:w-full">
        <div class="title pad-title">
          {{ $t('menu.plan.department') }}
        </div>
        <div class="content">
          {{ $t('menu.plan.resource') }}
        </div>
      </TinyCol>
      <TinyCol class="w-1/4 max-md:w-1/2 max-sm:w-full">
        <div class="title pad-title">
          {{ $t('menu.plan.job') }}
        </div>
        <div class="content pad-title">
          IT
        </div>
      </TinyCol>
      <TinyCol class="w-1/4 max-md:w-1/2 max-sm:w-full">
        <div class="title pad-title">
          {{ $t('menu.plan.person') }}
        </div>
        <div class="content pad-title">
          All
        </div>
      </TinyCol>
      <TinyCol class="w-1/4 max-md:w-1/2 max-sm:w-full">
        <div class="title pad-title">
          {{ $t('menu.plan.attribute') }}
        </div>
        <div class="content pad-title">
          IT
        </div>
      </TinyCol>
    </TinyRow>
  </div>
</template>

<style scoped lang="less"></style>
