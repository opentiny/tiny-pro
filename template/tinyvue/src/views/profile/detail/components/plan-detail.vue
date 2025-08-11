<template>
  <div class="plan-detail">
    <div class="detail-header">{{ $t('baseForm.form.label.people') }}</div>
    <tiny-row class="flex flex-wrap detail-row" noSpace>
      <tiny-col class="w-1/4 max-md:w-1/2 max-sm:w-full">
        <div class="title pad-title">
          {{ $t('baseForm.form.project') }}
        </div>
        <div class="content pad-title">
          {{ $t('work.mock.centralized') }}
        </div>
      </tiny-col>
      <tiny-col class="w-1/4 max-md:w-1/2 max-sm:w-full">
        <div class="title pad-title">
          {{ $t('menu.plan.department') }}
        </div>
        <div class="content">
          {{ $t('menu.plan.resource') }}
        </div>
      </tiny-col>
      <tiny-col class="w-1/4 max-md:w-1/2 max-sm:w-full">
        <div class="title pad-title">
          {{ $t('menu.plan.job') }}
        </div>
        <div class="content pad-title"> IT </div>
      </tiny-col>
      <tiny-col class="w-1/4 max-md:w-1/2 max-sm:w-full">
        <div class="title pad-title">
          {{ $t('menu.plan.person') }}
        </div>
        <div class="content pad-title"> All </div>
      </tiny-col>
      <tiny-col class="w-1/4 max-md:w-1/2 max-sm:w-full">
        <div class="title pad-title">
          {{ $t('menu.plan.attribute') }}
        </div>
        <div class="content pad-title"> IT </div>
      </tiny-col>
    </tiny-row>
  </div>
</template>

<script lang="ts" setup>
  import { Row as TinyRow, Col as TinyCol } from '@opentiny/vue';
</script>

<style scoped lang="less"></style>
