<script lang="ts" setup>
import { Modal, DatePicker as TinyDatePicker } from '@opentiny/vue'
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/store'

// 变量设置
const { t } = useI18n()
const userStore = useUserStore()
const endTime = ref('')

function reset() {
  endTime.value = ''
}

function handleBlur() {
  const start = new Date(
    JSON.parse(JSON.stringify(userStore.startTime)),
  ).getTime()
  const end = new Date(JSON.parse(JSON.stringify(endTime.value))).getTime()
  if (end < start) {
    endTime.value = ''
    Modal.message({
      message: t('userInfo.time.message'),
      status: 'error',
    })
  }
}

// 监听选择
watch(endTime, (newValue) => {
  userStore.setInfo({ endTime: newValue })
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
    <span>{{ $t('userInfo.filter.endTime') }}：</span>
    <TinyDatePicker
      v-model="endTime"
      value-format="yyyy-MM-dd"
      @blur="handleBlur"
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
