<template>
  <div>
    <tiny-layout>
      <tiny-row :flex="true" justify="center" class="margin-bottom">
        <tiny-col  v-for="item in state.options" :key="item.value" :span="3" >
          <div  class="col">
            <div>
              <img src="@/assets/images/collectImage1.png" />
            </div>
            <div class="favorite-title">{{ $t(item.value) }}</div>
            <div class="favorite-description">{{ $t(item.description) }}</div>
            <div class="favorite-info">
              <span :class="{'favorite-tip':true,'tip1':true ,'news':item?.isNews}">{{ $t(item.label1) }}</span>
              <span class="favorite-tip tip2">{{ $t(item.label2) }}</span>
            </div>
          </div>
        </tiny-col>
      </tiny-row>
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
import { reactive, onMounted } from 'vue';
import { getUserTrain } from '@/api/board';




// 切换数据
const state = reactive<{
  loading: any;
  options: any;
  project: string;
}>({
  loading: null,
  options: [] as any,
  project: '',
});
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
})
</script>

<style scoped lang="less">
.margin-bottom {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

.col {
  height: 192px;
  padding: 24px;

  img {
    height: 40px;
    width: 40px;
  }

  .favorite-title {
    margin-top: 12px;
    height: 22px;
    line-height: 22px;
    font-weight: 700;
    font-size: 14px;
  }

  .favorite-description {
    margin-top: 8px;
    font-size: 12px;
    color: #808080;
    text-align: left;
  }

  .favorite-info {
    text-align: left;
    margin-top: 8px;
  }

  .favorite-tip {
    height: 18px;
    line-height: 18px;
    font-size: 12px;
    padding: 0 4px;
    display: inline-block;
  }

  .tip1 {
    color: #F23030;
    background: #FFEAE8;
    margin-right: 4px;
  }

  .news{
    color: #029931;
    background: #E4F7E9;
    margin-right: 4px;
  }
  
  .tip2 {
    color: #191919;
    background: #f5f5f5;
  }
}

@media (max-width: @screen-md) {
  .font-pass {
    font-size: 24px;
  }

  .col>span:last-child {
    font-size: 10px;
  }
}
</style>
