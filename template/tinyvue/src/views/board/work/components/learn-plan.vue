<template>
  <tiny-layout>
    <tiny-row :flex="true" justify="center">
        <tiny-col>
          <div class="col">
            <div class="title">
              <span>{{ $t('work.index.plans') }}</span>
            </div>
            <div class="col-content">
              <tiny-progress
                class="progress"
                :show-text="false"
                :stroke-width="4"
                :percentage="20"
                color = "#f23030"
              ></tiny-progress>
              <span class="plan-pass">1890 <span class="num">&nbsp;/ {{ $t('work.index.Numbers') }}</span> </span>
            </div>
          </div>
        </tiny-col>
        <tiny-col>
          <div class="col">
            <div class="title">
              <span>{{ $t('work.index.Unfinished') }}</span>
            </div>
            <div class="col-content">
              <tiny-progress
                class="progress"
                :show-text="false"
                :stroke-width="4"
                :percentage="20"
                color = "#f23030"
              ></tiny-progress>
              <span class="plan-pass">23  <span class="num">&nbsp;/ {{ $t('work.index.Numbers') }}</span> </span>
            </div>
          </div>
        </tiny-col>
        <tiny-col>
          <div class="col">
            <div class="title">
              <span>{{ $t('work.index.beOverdue') }}</span>
            </div>
            <div class="col-content">
              <tiny-progress
                class="progress"
                :show-text="false"
                :stroke-width="4"
                :percentage="20"
                color = "#f23030"
              ></tiny-progress>
              <span class="plan-fail">113 <span class="num">&nbsp;/ {{ $t('work.index.Numbers') }}</span></span>
            </div>
          </div>
        </tiny-col>
        <tiny-col>
          <div class="col">
            <div class="title">
              <span>{{ $t('work.index.Overdue') }}</span>
            </div>
            <div class="col-content">
              <tiny-progress
                class="progress"
                :show-text="false"
                :stroke-width="4"
                :percentage="20"
                color = "#f23030"
              ></tiny-progress>
              <span class="plan-pass">56 <span class="num">&nbsp;/ {{ $t('work.index.Numbers') }}</span></span>
            </div>
          </div>
        </tiny-col>
    </tiny-row>
  </tiny-layout>
</template>

<script lang="ts" setup>
  import {
    Layout as TinyLayout,
    Row as TinyRow,
    Col as TinyCol,
    TinyProgress
  } from '@opentiny/vue';
</script>

<style scoped lang="less">
  .col {
    height: 106px;
    text-align: center;
    background: #f5f5f5;
    border-radius: 10px;
    .col-content{
      margin: 0 24px;
      display: flex;
      justify-content: space-between;
      .progress{
        width: 50%;
      }
      .plan-pass{
        font-size: 20px;
        font-weight: 700;
      }
    }
  }
  :deep(.tiny-col:first-child) {
   padding-left: 0;
  }

  .font {
    font-weight: 600;
    font-size: 48px;
    line-height: 36px;
    text-align: left;
  }

  .col > div {
    color: #252b3a;
    font-size: 14px;
    line-height: 24px;

    .num {
      color: #adb0b8;
      font-size: 14px;
      line-height: 14px;
    }
  }

  .title {
    display: flex;
    align-items: center;
    padding: 16px  24px 6px;
  }
  

  // responsive
  @media (max-width: @screen-md) {
    .col > div {
      font-size: 10px;

      .plan-pass,
      .plan-fail {
        font-size: 24px;
      }
    }
  }
</style>
