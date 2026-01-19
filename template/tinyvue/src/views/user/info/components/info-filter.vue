<script lang="ts" setup>
import { Modal, Button as TinyButton } from '@opentiny/vue'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/store'
import infofilterendtime from './info-filterEndTime.vue'
import infofilterstarttime from './info-filterStartTime.vue'
import infofilterstatus from './info-filterStatus.vue'
import infofiltertype from './info-filterType.vue'

const props = defineProps({
  activeName: String,
})
const userStore = useUserStore()
const filterstarttime = ref()
const filterendtime = ref()
const filterstatus = ref()
const filtertype = ref()
const { t } = useI18n()

// 重置筛选项
function reset() {
  if (props.activeName === '1') {
    filterstarttime.value.reset()
    filterendtime.value.reset()
  }
  filterstatus.value.reset()
  filtertype.value.reset()
  userStore.resetFilterInfo()
  userStore.setInfo({ reset: true })
}

function submit() {
  if (props.activeName === '1') {
    userStore.startTime === ''
    || userStore.endTime === ''
    || userStore.filterStatus?.length === 0
    || userStore.filterType?.length === 0
      ? Modal.message({
          message: t('userInfo.filter.all'),
          status: 'error',
        })
      : userStore.setInfo({ submit: true, sort: undefined })
  }
  else {
    userStore.filterStatus?.length === 0 || userStore.filterType?.length === 0
      ? Modal.message({
          message: t('userInfo.filter.all'),
          status: 'error',
        })
      : userStore.setInfo({ submit: true, sort: undefined })
  }
}
defineExpose({
  reset,
})
</script>

<template>
  <div>
    <infofilterstarttime
      v-if="activeName === '1'"
      ref="filterstarttime"
    />
    <infofilterendtime
      v-if="activeName === '1'"
      ref="filterendtime"
    />
    <infofilterstatus ref="filterstatus" />
    <infofiltertype ref="filtertype" />
    <TinyButton type="primary" @click="submit">
      {{
        $t('userInfo.btn.search')
      }}
    </TinyButton>
    <TinyButton @click="reset">
      {{ $t('userInfo.btn.reset') }}
    </TinyButton>
  </div>
</template>

<style scoped lang="less">
  button {
  margin-top: 10%;
  margin-left: 35%;
}
</style>
