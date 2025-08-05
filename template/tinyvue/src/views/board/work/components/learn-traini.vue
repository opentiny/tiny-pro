<template>
  <div>
    <tiny-layout>
      <div class="grid grid-cols-4 gap-4 max-md:grid-cols-2">
        <tiny-col
          v-for="item in state.options"
          :key="item.value"
          class="p-6 bg-white rounded col flex flex-col justify-start items-start"
        >
          <img src="@/assets/images/collectImage1.png" class="w-10 h-10" />
          <div class="mt-3 text-[14px] font-bold leading-[22px] max-md:text-[12px] max-md:leading-[18px]">
            {{ $t(item.value) }}
          </div>
          <div class="mt-2 text-[12px] text-gray-500 text-left max-md:text-[10px] max-md:leading-[16px]">
            {{ $t(item.description) }}
          </div>
          <div class="mt-2 text-left space-x-1">
            <span
              class="inline-block px-1 h-[18px] leading-[18px] text-xs rounded"
              :class="item?.isNews ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'"
            >
              {{ $t(item.label1) }}
            </span>
            <span class="inline-block px-1 h-[18px] leading-[18px] text-xs bg-gray-100 text-black rounded">
              {{ $t(item.label2) }}
            </span>
          </div>
        </tiny-col>
      </div>
    </tiny-layout>
  </div>
</template>


<script lang="ts" setup>
import {
  Layout as TinyLayout,
  Row as TinyRow,
  Col as TinyCol,
  Loading,
} from '@opentiny/vue';
import { reactive, onMounted, onBeforeUnmount } from 'vue';
import { getUserTrain } from '@/api/board';




// 切换数据
const state = reactive<{
  loading: any;
  options: any;
  project: string;
  span: number;
}>({
  loading: null,
  options: [] as any,
  project: '',
  span: 3,
});

const updateSpan = () => {
  const isMobile = window.innerWidth < 768
  state.span = isMobile ? 6 : 3
}

const fetchData = async () => {
  state.loading = Loading.service({
    text: 'loading...',
    target: document.getElementById('container'),
    background: 'rgba(0, 0, 0, 0.7)',
  });
  try {
    const { data } = await getUserTrain();
    state.options = data.options;
  } finally {
    state.loading.close();
  }

};

// 初始化请求数据
onMounted(() => {
  fetchData();
  updateSpan()
  window.addEventListener('resize', updateSpan)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateSpan)
})
</script>