<template>
  <div class="falls-box">
    <div class="falls">
      <img src="@/assets/images/map-background2.png" class="image" />
      <h3>{{ $t('home.falls.line') }}</h3>
      <tiny-chart-waterfall id="flow" ref="waterFallRef" height="100%" :options="options" :extend="chartExtend" ></tiny-chart-waterfall>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { onMounted, watch, ref, nextTick } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { TinyHuichartsWaterfall as TinyChartWaterfall } from '@opentiny/vue-huicharts'
  import useLocale from '@/hooks/locale';

  const { t } = useI18n();
  const { currentLocale } = useLocale();

  const list = [
    {
      label: 'Dns',
      value: 'Dns',
    },
    {
      label: t('home.falls.tcp'),
      value: 'TCP',
    },
    {
      label: t('home.falls.ssl'),
      value: 'SSL',
    },
    {
      label: 'Dns',
      value: 'Dns',
    },
    {
      label: t('home.falls.tcp'),
      value: 'TCP',
    },
    {
      label: t('home.falls.ssl'),
      value: 'SSL',
    },
    {
      label: 'Dns',
      value: 'Dns',
    },
    {
      label: t('home.falls.tcp'),
      value: 'TCP',
    },
    {
      label: t('home.falls.ssl'),
      value: 'SSL',
    },
    {
      label: 'Dns',
      value: 'Dns',
    },
    {
      label: t('home.falls.tcp'),
      value: 'TCP',
    },
    {
      label: t('home.falls.ssl'),
      value: 'SSL',
    },
  ];
  const waterFallRef = ref();
  const options = ref({
    data: [],
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'value',
      show: false,
    },
    yAxis: {
      type: 'category',
      axisLabel: {
        formatter(value: any, index: any) {
          return (
            // eslint-disable-next-line prefer-template
            list[index]?.label + '  ' + list[index]?.value + '  ' + value + 's'
          );
        },
        margin: 20,
      },
      axisLine: {
        show: true,
        lineStyle: {
          color: '#333',
        },
      },
      axisTick: {
        show: true,
        inside: false,
        lineStyle: {
          color: '#333',
        },
      },
      splitLine: {
        show: false,
      }
    }
  })
  const chartExtend = ref({
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
      formatter(params: any) {
        let tar;
        if (params[1].value !== '-') {
          // eslint-disable-next-line prefer-destructuring
          tar = params[1];
        } else {
          // eslint-disable-next-line prefer-destructuring
          tar = params[0];
        }
        // eslint-disable-next-line prefer-template
        return tar.name + '<br/>' + tar.seriesName + ' : ' + tar.value;
      },
    },
    series: [
      {
        name: 'Placeholder',
        type: 'bar',
        stack: 'Total',
        itemStyle: {
          borderColor: 'transparent',
          color: 'transparent',
        },
        emphasis: {
          itemStyle: {
            borderColor: 'transparent',
            color: 'transparent',
          },
        },
        data: [0, 900, 405, 250, 136, 236, 651, 169, 156, 195, 192],
      },
      {
        name: 'Income',
        type: 'bar',
        stack: 'Total',
        itemStyle: {
          color: '#4e85f4',
          barBorderRadius: [2, 2, 2, 2],
        },
        label: {
          show: false,
        },
        data: [500, '-', 593, '-', '-', 135, 178, 286, '-', '-', '-'],
      },
      {
        name: 'Expenses',
        type: 'bar',
        stack: 'Total',
        itemStyle: {
          color: '#5f45ff',
          barBorderRadius: [5, 5, 5, 5],
        },
        label: {
          show: false,
        },
        data: ['-', '-', '-', 408, 154, '-', '-', '-', 119, 361, '-'],
      },
      {
        name: 'test',
        type: 'bar',
        stack: 'Total',
        itemStyle: {
          color: '#e2b525 ',
          barBorderRadius: [5, 5, 5, 5],
        },
        label: {
          show: false,
        },
        data: ['-', 99, '-', '-', '-', '-', '-', '-', '-', '-', 32],
      },
    ],
  });

  onMounted(() => {
    window.addEventListener('resize', () => {
      waterFallRef.value?.resize();
    });
    setTimeout(() => {
      waterFallRef.value?.resize();
    }, 200)
  });

  watch(currentLocale, (newValue, oldValue) => {
    waterFallRef.value?.resize();
  });
</script>

<style scoped lang="less">
  .falls-box {
    margin-top: 20px;
    padding: 20px 16px;
    background: #fff;
    border-radius: 6px;
    box-shadow: 0 3px 10px #4062e133;
  }

  .falls {
    width: 100%;
    height: 406px;
    margin-top: 2%;
  }

  #flow {
    width: 100%;
    height: inherit;
  }

  .image {
    float: left;
    width: 25px;
    margin-top: 0.5%;
    margin-left: 0.5%;
    border-radius: 4px;
    opacity: 0.6;
  }

  h3 {
    float: left;
    width: 200px;
    margin-top: 0.5%;
    margin-left: 0.5%;
    color: #524343;
    font-weight: 700;
    font-size: 18px;
  }
</style>
