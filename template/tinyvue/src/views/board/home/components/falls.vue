<script lang="ts" setup>
import { TinyHuichartsBar as TinyChartBar } from '@opentiny/vue-huicharts'
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import useLocale from '@/hooks/locale'
import { debounce } from '@/hooks/responsive'

const { t } = useI18n()
const { currentLocale } = useLocale()

const playData = [12, 22, 10, 18, 25, 14]
const pageData = [20, 15, 26, 22, 18, 24]
const pvData = [8, 18, 14, 26, 12, 20]

function getPhases() {
  return ['DNS', t('home.falls.tcp'), t('home.falls.ssl'), 'Dns', t('home.falls.tcp'), t('home.falls.ssl')]
}

function buildRows() {
  const phases = getPhases()
  return phases.map((phase, index) => ({
    phase,
    [t('home.curve.play')]: playData[index],
    [t('home.curve.page')]: pageData[index],
    [t('home.main.down')]: pvData[index],
  }))
}

const barRef = ref()
const options = ref({
  data: buildRows(),
  xAxis: [
    {
      keyName: 'phase',
    },
  ],
})
const chartExtend = ref({
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true,
  },
  color: ['#4e85f4', '#5f45ff', '#ff9e03'],
  legend: {
    data: [t('home.curve.play'), t('home.curve.page'), t('home.main.down')],
    top: '10',
    left: 'auto',
    right: '24',
    icon: 'circle',
    itemWidth: 10,
    itemHeight: 10,
    itemGap: 24,
    textStyle: {
      fontSize: 14,
    },
  },
  yAxis: [
    {
      min: 0,
      max: 40,
      interval: 5,
      axisLabel: {
        formatter: '{value} s',
      },
    },
  ],
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow',
    },
    valueFormatter(value: any) {
      return `${value} s`
    },
  },
  series: [
    {
      barWidth: 10,
      itemStyle: {
        borderRadius: [3, 3, 0, 0],
      },
    },
    {
      barWidth: 10,
      itemStyle: {
        borderRadius: [3, 3, 0, 0],
      },
    },
    {
      barWidth: 10,
      itemStyle: {
        borderRadius: [3, 3, 0, 0],
      },
    },
  ],
})

onMounted(() => {
  const resizeHandler = debounce(() => barRef.value?.resize(), 200)
  window.addEventListener('resize', resizeHandler)

  const el = barRef.value?.$el || barRef.value
  let observer: ResizeObserver | null = null
  if (el) {
    observer = new ResizeObserver(() => barRef.value?.resize())
    observer.observe(el)
  }

  setTimeout(() => {
    barRef.value?.resize()
  }, 200)

  onUnmounted(() => {
    window.removeEventListener('resize', resizeHandler)
    observer?.disconnect()
  })
})

watch(currentLocale, () => {
  options.value.data = buildRows()
  chartExtend.value.legend.data = [t('home.curve.play'), t('home.curve.page'), t('home.main.down')]
  barRef.value?.resize()
})
</script>

<template>
  <div class="falls-box">
    <h3 class="title">
      {{ $t('home.falls.line') }}
    </h3>

    <div class="falls">
      <TinyChartBar
        ref="barRef"
        width="100%"
        height="100%"
        :options="options"
        :extend="chartExtend"
      />
    </div>
  </div>
</template>

<style scoped lang="less">
.falls-box {
  margin-top: 16px;
  padding: 24px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 3px 10px #4062e133;
}

.falls {
  width: 100%;
  height: 400px;
}

.title {
  margin-bottom: 16px;
  color: #191919;
  font-weight: 600;
  font-size: 16px;
  line-height: 24px;
}
</style>
