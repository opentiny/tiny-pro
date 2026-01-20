<script lang="ts" setup>
import { TinyHuichartsBar as TinyChartBar, TinyHuichartsLine as TinyChartLine } from '@opentiny/vue-huicharts'
import { onMounted, onUnmounted, ref } from 'vue'

// 加载效果
const options1 = ref({
  xAxis:
  {
    data: 'xkey',
    show: true,
    ellipsis: {
      labelWidth: 30,
      overflow: 'truncate',
    },
  },
  yAxis: {
    name: 'Mbps',
    show: true,
    splitNumber: 5,
    axisLabel: {
      show: true,
    },
  },
  direction: 'vertical',
  type: 'stack',
  padding: [48, 0, 4, 0],
  legend: {
    show: true,
    position: {
      top: 4,
      right: '0',
    },
    textStyle: {
      padding: [-2, 0, 0, 0],
    },
    type: 'scroll',
    pageIconSize: 10,
  },
  dataZoom: {
    show: false,
  },
  color: ['#1476ff', '#0bb8b2'],
  data: [
    {
      未完成: 100,
      已完成: 380,
      xkey: '1月',
    },
    {
      未完成: 100,
      已完成: 420,
      xkey: '2月',
    },
    {
      未完成: 100,
      已完成: 780,
      xkey: '3月',
    },
    {
      未完成: 100,
      已完成: 600,
      xkey: '4月',
    },
    {
      未完成: 100,
      已完成: 680,
      xkey: '5月',
    },
    {
      未完成: 100,
      已完成: 80,
      xkey: '6月',
    },
    {
      未完成: 100,
      已完成: 380,
      xkey: '7月',
    },
    {
      未完成: 100,
      已完成: 380,
      xkey: '8月',
    },
    {
      未完成: 100,
      已完成: 380,
      xkey: '9月',
    },
    {
      未完成: 100,
      已完成: 380,
      xkey: '10月',
    },
  ],
})
const options2 = ref({
  smooth: true,
  area: true,
  stack: true,
  xAxis:
  {
    data: 'xkey',
    show: true,
  },
  yAxis: {
    name: '人',
    show: true,
    axisLabel: {
      intervar: 0,
      show: true,
    },
  },
  padding: [48, 0, 4, 0],
  legend: {
    show: true,
    position: {
      top: 4,
      right: '0',
    },
    textStyle: {
      padding: [-2, 0, 0, 0],
    },
    type: 'scroll',
    pageIconSize: 10,
  },
  dataZoom: {
    show: false,
  },
  color: ['#F2E70C', '#FFB700', '#FF8800', '#F23030'],
  data: [
    {
      财务部: 200,
      研发部: 150,
      xkey: '1月',
      运营部: 100,
      人力部: 50,
    },
    {
      财务部: 400,
      研发部: 350,
      xkey: '2月',
      运营部: 300,
      人力部: 250,
    },
    {
      财务部: 200,
      研发部: 100,
      xkey: '3月',
      运营部: 500,
      人力部: 100,
    },
    {
      财务部: 500,
      研发部: 450,
      xkey: '4月',
      运营部: 400,
      人力部: 300,
    },
    {
      财务部: 300,
      研发部: 350,
      xkey: '5月',
      运营部: 300,
      人力部: 250,
    },
    {
      财务部: 200,
      研发部: 150,
      xkey: '6月',
      运营部: 100,
      人力部: 50,
    },

  ],
})
const barRef = ref()
const lineRef = ref()
onMounted(() => {
  setTimeout(() => {
    barRef.value?.resize()
    lineRef.value?.resize()
  }, 200)

  const observer = new ResizeObserver(() => {
    barRef.value?.resize()
    lineRef.value?.resize()
  })

  const el1 = barRef.value?.$el || barRef.value
  const el2 = lineRef.value?.$el || lineRef.value

  if (el1) {
    observer.observe(el1)
  }
  if (el2) {
    observer.observe(el2)
  }

  onUnmounted(() => observer.disconnect())
})
</script>

<template>
  <div>
    <div class="min-h-[272px] w-full flex gap-10 max-md:flex-col">
      <div class="w-1/2 max-md:w-full">
        <div class="card-title mb-2">
          {{ $t('work.index.trainees') }}
        </div>
        <TinyChartBar ref="barRef" width="100%" height="272px" :options="options1" />
      </div>
      <div class="w-1/2 max-md:w-full">
        <div class="card-title mb-2">
          {{ $t('work.index.coachNum') }}
        </div>
        <TinyChartLine ref="lineRef" width="100%" height="272px" :options="options2" />
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.card-title {
  height: 24px;
  line-height: 24px;
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 16px;
}
</style>
