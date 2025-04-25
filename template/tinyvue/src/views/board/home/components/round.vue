<template>
  <div class="round-box">
    <div class="round">
      <div>
        <img src="@/assets/images/map-background3.png" class="image" />
        <h3>{{ $t('home.round.title') }}</h3>
        <tiny-chart-ring id="circled" ref="ringRef" height="100%" :options="options" :extend="chartExtend"></tiny-chart-ring>
      </div>
      <div class="round-from">
        <RoundTable></RoundTable>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { onMounted, watch, inject, ref, nextTick } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { TinyHuichartsRing as TinyChartRing } from '@opentiny/vue-huicharts'
  import useLocale from '@/hooks/locale';
  import RoundTable from './roundtable.vue';

  const { t } = useI18n();
  const { currentLocale } = useLocale();
  const ringRef = ref();
  const options = ref({
    data: [
      { value: 300, name: '5G' },
      { value: 1048, name: '4G' },
      { value: 735, name: 'unknow' },
      { value: 580, name: '3G' },
    ]
  })
  const chartExtend = ref({
    color: ['#5470c6', '#91cc74', '#fac858', '#ee6666'],
    tooltip: {
      trigger: 'item',
    },
    legend: {
      orient: 'vertical',
      left: 'right',
      top: 'center',
      icon: '',
      align: 'right',
      itemWidth: 25,
      itemHeight: 14,
      itemGap: 10,
    },
    series: [
      {
        type: 'pie',
        selectedMode: 'single',
        radius: ['60%', '80%'],
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
            fontSize: '40',
            fontWeight: 'bold',
          },
        },
        labelLine: {
          show: false,
        }
      },
    ],
  })

  onMounted(() => {
    window.addEventListener('resize', () => {
      ringRef.value.resize();
    });
    nextTick(() => {
      ringRef.value.resize();
    });
  });

  watch(currentLocale, (newValue, oldValue) => {
    ringRef.value.resize();
  });
</script>

<style scoped lang="less">
  .round-box {
    margin-top: 20px;
    padding: 20px 16px;
    background: #fff;
    border-radius: 6px;
    box-shadow: 0 3px 10px #4062e133;
  }

  .round {
    display: flex;
    justify-content: space-between;
    border-radius: 6px;
  }

  #circled {
    width: 32vw !important;
    height: 350px;
    margin-left: 2.3%;
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
    width: 46vw;
    margin-top: 2%;
    margin-left: 5%;
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
