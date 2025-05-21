<template>
  <div class="whole-detail">
    <div class="detail-header">{{ $t('baseForm.form.label.evaluation') }}</div>
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
          {{ $t('menu.plan.whole') }}
        </div>
        <div class="content">
          {{ $t('menu.plan.evaluation') }}
        </div>
      </tiny-col>
    </tiny-row>
  </div>
</template>

<script lang="ts" setup>
  import { Row as TinyRow, Col as TinyCol } from '@opentiny/vue';
</script>

<style scoped lang="less"></style>
