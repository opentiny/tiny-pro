<template>
  <div class="container-detail">
    <div class="container-header">{{ $t('menu.profile.detail') }}</div>
    <div class="base-body">
      <div class="detail-card">
        <planDetail></planDetail>
      </div>
      <div class="detail-card mart_16">
        <targetDetail></targetDetail>
      </div>
      <div class="detail-card mart_16">
        <evaluationDetail></evaluationDetail>
      </div>
      <div class="detail-card mart_16">
        <wholeDetail></wholeDetail>
      </div>
      <div class="detail-card mart_16">
        <mentor></mentor>
      </div>
      <div class="detail-card footer-card mart_16">
        <recordDetail :table-data="state.tableData as any"></recordDetail>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { reactive, onMounted } from 'vue';
  import {
    Row as TinyRow,
    Col as TinyCol,
    Select as TinySelect,
    Option as TinyOption,
    Collapse as TinyCollapse,
    CollapseItem as TinyCollapseItem,
    Loading,
  } from '@opentiny/vue';
  import { getDetailData } from '@/api/profile';
  import planDetail from './components/plan-detail.vue';
  import targetDetail from './components/target-detail.vue';
  import evaluationDetail from './components/evaluation-detail.vue';
  import wholeDetail from './components/whole-detail.vue';
  import mentor from './components/mentor-detail.vue';
  import recordDetail from './components/record-detail.vue';

  // 加载效果
  const state = reactive<{
    loading: any;
    tableData: Array<object>;
  }>({
    loading: null,
    tableData: [],
  });

  // 请求数据接口方法
  const fetchData = async () => {
    state.loading = Loading.service({
      text: 'loading...',
      target: document.getElementById('container'),
      background: 'rgba(0, 0, 0, 0.7)',
    });
    try {
      const { data } = await getDetailData();
      state.tableData = data.tableData;
    } finally {
      state.loading.close();
    }
  };

  // 初始化请求数据
  onMounted(() => {
    fetchData();
  });
</script>

<style scoped lang="less">
  @import '@/assets/style/details.less';
</style>
