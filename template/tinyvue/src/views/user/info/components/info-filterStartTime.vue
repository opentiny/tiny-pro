<script lang="ts" setup>
import { DatePicker as TinyDatePicker } from '@opentiny/vue'
import { ref, watch } from 'vue'
import { useUserStore } from '@/store'

// 变量设置
const userStore = useUserStore()
const startTime = ref('')

function reset() {
  startTime.value = ''
}

// 监听选择
watch(startTime, (newValue) => {
  userStore.setInfo({ startTime: newValue })
})

defineExpose({
  reset,
})
</script>

<template>
  <div class="option">
    <div class="required">
      *
    </div>
    <span>{{ $t('userInfo.filter.startTime') }}：</span>
    <TinyDatePicker
      v-model="startTime"
      value-format="yyyy-MM-dd"
    />
  </div>
</template>

<style scoped lang="less">
  .option {
  .required {
    margin-top: 5px;
    color: rgb(190, 24, 24);
    font-size: 140%;
  }

  span {
    width: 110px;
    height: 18px;
    font-size: 14px;
  }

  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 10px 3px;
}
</style>
