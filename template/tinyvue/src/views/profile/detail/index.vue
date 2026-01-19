<script lang="ts" setup>
import {
  Loading,
} from '@opentiny/vue'
import { onMounted, reactive } from 'vue'
import { getDetailData } from '@/api/profile'
import evaluationDetail from './components/evaluation-detail.vue'
import mentor from './components/mentor-detail.vue'
import planDetail from './components/plan-detail.vue'
import recordDetail from './components/record-detail.vue'
import targetDetail from './components/target-detail.vue'
import wholeDetail from './components/whole-detail.vue'

// 加载效果
const state = reactive<{
  loading: any
  tableData: Array<object>
}>({
  loading: null,
  tableData: [],
})

// 请求数据接口方法
async function fetchData() {
  state.loading = Loading.service({
    text: 'loading...',
    target: document.getElementById('container'),
    background: 'rgba(0, 0, 0, 0.7)',
  })
  try {
    const { data } = await getDetailData()
    state.tableData = data.tableData
  }
  finally {
    state.loading.close()
  }
}

// 初始化请求数据
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
        <planDetail />
      </div>
      <div class="detail-card mart_16">
        <targetDetail />
      </div>
      <div class="detail-card mart_16">
        <evaluationDetail />
      </div>
      <div class="detail-card mart_16">
        <wholeDetail />
      </div>
      <div class="detail-card mart_16">
        <mentor />
      </div>
      <div class="detail-card footer-card mart_16">
        <recordDetail :table-data="state.tableData as any" />
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
  @import '@/assets/style/details.less';
</style>
