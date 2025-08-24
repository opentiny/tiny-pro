<template>
  <div class="flex flex-wrap gap-6">
    <div v-for="i in 6" :key="i" class="col flex items-center min-h-[48px] px-6 bg-[#f5f5f5] rounded-md flex-[0_0_calc(33.333%-16px)] max-md:flex-[0_0_100%]">
      <span class="max-w-full text-[14px] text-[#191919] line-clamp-2">{{ $t(`work.index.questions${i}`) }}</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
</script>

<style scoped lang="less">
  .col {
    &:hover{
      background: #fff;
      box-shadow: 0 4px 16px 0 rgba(0,0,0,0.08);
    }
  }
</style>