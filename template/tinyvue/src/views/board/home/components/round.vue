<script lang="ts" setup>
import { TinyHuichartsRing as TinyChartRing } from '@opentiny/vue-huicharts'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import useLocale from '@/hooks/locale'
import { debounce } from '@/hooks/responsive'
import RoundTable from './roundtable.vue'

const { currentLocale } = useLocale()
const ringRef = ref()
const options = ref({
  data: [
    { value: 300, name: '5G' },
    { value: 1048, name: '4G' },
    { value: 735, name: 'unknow' },
    { value: 580, name: '3G' },
  ],
})

const windowWidth = ref(0)

const chartExtend = computed(() => {
  const isSm = windowWidth.value <= 375

  return {
    color: ['#5470c6', '#91cc74', '#fac858', '#ee6666'],
    tooltip: {
      trigger: 'item',
    },
    legend: {
      orient: 'horizontal',
      left: 'center',
      top: 'bottom',
      icon: '',
      align: 'right',
      itemWidth: 20,
      itemHeight: 14,
      itemGap: 10,
    },
    series: [
      {
        type: 'pie',
        selectedMode: 'single',
        radius: ['50%', '65%'],
        center: ['50%', '55%'],
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2,
        },
        avoidLabelOverlap: true,
        label: {
          show: false,
          position: 'center',
        },
        width: '100%',
        emphasis: {
          label: {
            show: true,
            fontSize: isSm ? 20 : 40,
            fontWeight: 'bold',
          },
        },
        labelLine: {
          show: false,
        },
      },
    ],
  }
})

onMounted(() => {
  const resizeHandler = debounce(() => {
    windowWidth.value = window.innerWidth
    ringRef.value?.resize()
  }, 200)

  window.addEventListener('resize', resizeHandler)

  const el = ringRef.value?.$el || ringRef.value
  let observer: ResizeObserver | null = null
  if (el) {
    observer = new ResizeObserver(() => ringRef.value?.resize())
    observer.observe(el)
  }

  resizeHandler()
  setTimeout(() => {
    ringRef.value?.resize()
  }, 200)

  onUnmounted(() => {
    window.removeEventListener('resize', resizeHandler)
  })
  setTimeout(() => {
    ringRef.value?.resize()
  }, 200)
})

const chartWidth = computed(() => windowWidth.value <= 768 ? '80vw' : '30vw')

watch(currentLocale, () => {
  ringRef.value?.resize()
})
</script>

<template>
  <div class="round-box">
    <div class="flex items-start">
      <img src="@/assets/images/map-background3.png" class="image">
      <h3>{{ $t('home.round.title') }}</h3>
    </div>

    <div class="round w-full flex max-md:flex-col max-md:items-center">
      <TinyChartRing
        ref="ringRef"
        :width="chartWidth"
        height="40vh"
        :options="options"
        :extend="chartExtend"
      />
      <div class="round-from ml-[5%] w-[46vw] max-md:ml-[0%] max-md:w-[100%] max-md:pt-[5%] max-sm:pt-[10%]">
        <RoundTable />
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.round-box {
  margin-top: 20px;
  padding: 20px 16px;
  background: #fff;
  border-radius: 6px;
  box-shadow: 0 3px 10px #4062e133;
}

.round {
  justify-content: space-between;
  border-radius: 6px;
}

.image {
  float: left;
  width: 25px;
  margin-top: 1.5%;
  margin-left: 1.5%;
  border-radius: 4px;
  opacity: 0.6;
}

.round-from {
  margin-top: 2%;
}

h3 {
  float: left;
  width: 300px;
  margin-top: 1.4%;
  margin-left: 1.5%;
  color: #524343;
  font-weight: 700;
  font-size: 18px;
}
</style>
