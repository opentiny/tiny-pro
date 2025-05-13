<template>
  <div class="margin-bottom">
    <div class="col">
      <span class="font-pass">{{ $t('work.index.questions1') }}</span>
    </div>
    <div class="col">
      <span class="font-pass">{{ $t('work.index.questions2') }}</span>
    </div>
    <div class="col">
      <span class="font-pass">{{ $t('work.index.questions3') }}</span>
    </div>
    <div class="col">
      <span class="font-pass">{{ $t('work.index.questions4') }}</span>
    </div>
    <div class="col">
      <span class="font-pass">{{ $t('work.index.questions5') }}</span>
    </div>
    <div class="col">
      <span class="font-pass">{{ $t('work.index.questions6') }}</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
</script>

<style scoped lang="less">
.margin-bottom {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  /* 项目间距 */
}

.col {
  flex: 0 0 calc(33.333% - 16px);
  height: 48px;
  line-height: 48px;
  background: #f5f5f5;
  border-radius: 8px;

  .font-pass {
    margin-left: 24px;
    font-size: 14px;
    color: #191919;
  }
}


@media (max-width: @screen-md) {
  .font-pass {
    font-size: 24px;
  }

  .col>span:last-child {
    font-size: 10px;
  }
}
</style>
