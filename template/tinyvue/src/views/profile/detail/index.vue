<script lang="ts" setup>
import type { DetailTableData } from '@/api/profile'
import { Loading } from '@opentiny/vue'
import { defineAsyncComponent, onMounted, ref } from 'vue'
import { getDetailData } from '@/api/profile'

const EvaluationDetail = defineAsyncComponent(() => import('./components/evaluation-detail.vue'))
const Mentor = defineAsyncComponent(() => import('./components/mentor-detail.vue'))
const PlanDetail = defineAsyncComponent(() => import('./components/plan-detail.vue'))
const RecordDetail = defineAsyncComponent(() => import('./components/record-detail.vue'))
const TargetDetail = defineAsyncComponent(() => import('./components/target-detail.vue'))
const WholeDetail = defineAsyncComponent(() => import('./components/whole-detail.vue'))

const loading = ref<any>()

const tableData = ref<DetailTableData[]>([])

// 请求数据接口方法
async function fetchData() {
  loading.value = Loading.service({
    text: 'loading...',
    target: document.getElementById('container'),
    background: 'rgba(0, 0, 0, 0.7)',
  })

  try {
    const { data } = await getDetailData()
    tableData.value = data.tableData
  }
  finally {
    loading.value.close()
  }
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="container-detail">
    <div class="container-header">
      <Breadcrumb :items="['menu.profile', 'menu.profile.detail']" />
    </div>
    <div class="base-body">
      <div class="detail-card">
        <PlanDetail />
      </div>
      <div class="detail-card mart_16">
        <TargetDetail />
      </div>
      <div class="detail-card mart_16">
        <EvaluationDetail />
      </div>
      <div class="detail-card mart_16">
        <WholeDetail />
      </div>
      <div class="detail-card mart_16">
        <Mentor />
      </div>
      <div class="detail-card footer-card mart_16">
        <RecordDetail :table-data="tableData" />
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
@import '@/assets/style/details.less';
</style>
