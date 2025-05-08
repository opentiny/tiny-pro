<template>
  <div>
    <tiny-layout>
      <tiny-row :flex="true" justify="center">
        <transition-fade-slide-group>
          <tiny-col :span="8">
            <div class="col">
              <div class="right">
                <img src="@/assets/images/coach-1.png" />
              </div>
            </div>
          </tiny-col>
          <tiny-col :span="8">
            <div class="col">
              <div class="right">
                <img src="@/assets/images/coach-2.png" />
              </div>
            </div>
          </tiny-col>
        </transition-fade-slide-group>
      </tiny-row>
    </tiny-layout>
  </div>
</template>

<script lang="ts" setup>
  import {
    Layout as TinyLayout,
    Row as TinyRow,
    Col as TinyCol,
    Select as TinySelect,
    Option as TinyOption,
    Loading,
  } from '@opentiny/vue';
  import { reactive, onMounted, watch, ref } from 'vue';
  import { getUserData, getUserChange } from '@/api/board';
  import transitionFadeSlideGroup from '@/components/transition/transition-fade-slide-group.vue';

  // 加载效果
  const state = reactive<{
    loading: any;
    options: any;
    project: string;
  }>({
    loading: null,
    options: [] as any,
    project: '',
  });

  // 请求数据接口方法
  const fetchData = async () => {
    state.loading = Loading.service({
      text: 'loading...',
      target: document.getElementById('container'),
      background: 'rgba(0, 0, 0, 0.7)',
    });
    try {
      const { data } = await getUserData();
      state.options = data.options;
    } finally {
      state.loading.close();
    }
  };

  // 初始化请求数据
  onMounted(() => {
    fetchData();
  });

  // 切换数据
  let number = ref([]);
  const fetchSelect = async (param: string) => {
    const { data } = await getUserChange(param);
    number.value = data;
  };

  // 切换数据
  watch(
    state,
    (newValue, oldValue) => {
      fetchSelect(newValue.project);
    },
    { immediate: true },
  );
</script>

<style scoped lang="less">
  .col {
    min-height: 300px;
  }
  .left {
    width: 100%;
  }

  .right {
    width: 100%;
  }

  .left,
  .right {
    display: flex;
    flex-direction: column;
  
    img{
      height: 290px;
    }
  }
</style>
