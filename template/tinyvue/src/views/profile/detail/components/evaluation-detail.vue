<template>
  <div class="evaluation-detail">
    <div class="detail-header">{{ $t('baseForm.form.label.plan') }}</div>
    <tiny-row class="flex flex-wrap detail-row" noSpace>
      <tiny-col class="w-1/4 max-md:w-1/2 max-sm:w-full">
        <div class="title pad-title">
          {{ $t('menu.plan.develop') }}
        </div>
        <div class="content pad-title">
          {{ $t('menu.plan.yes') }}
        </div>
      </tiny-col>
      <tiny-col class="w-1/4 max-md:w-1/2 max-sm:w-full">
        <div class="title pad-title">
          {{ $t('menu.plan.frequency') }}
        </div>
        <div class="content">
          {{ $t('menu.plan.month') }}
        </div>
      </tiny-col>
      <tiny-col class="w-1/4 max-md:w-1/2 max-sm:w-full">
        <div class="title pad-title">
          {{ $t('menu.plan.goal') }}
        </div>
        <div class="content pad-title"> {{ $t('menu.plan.trainees') }} </div>
      </tiny-col>
      <tiny-col class="w-1/4 max-md:w-1/2 max-sm:w-full">
        <div class="title pad-title">
          {{ $t('menu.plan.condition') }}
        </div>
        <div class="content pad-title"> {{ $t('menu.plan.teacher') }} </div>
      </tiny-col>
      <tiny-col class="w-1/4 max-md:w-1/2 max-sm:w-full">
        <div class="title pad-title">
          {{ $t('menu.plan.phase') }}
        </div>
        <div class="content pad-title"> {{ $t('menu.plan.evaluation') }} </div>
      </tiny-col>
    </tiny-row>
  </div>
</template>

<script lang="ts" setup>
  import { Row as TinyRow, Col as TinyCol } from '@opentiny/vue';
</script>

<style scoped lang="less"></style>
