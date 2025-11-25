<template>
  <div>
    <Breadcrumb :items="['menu.list', 'menu.list.cardList']" />
    <div class="content">
      <div class="header mb-4">{{ $t('cardList.tiltle') }}</div>
      <div class="flex flex-wrap gap-2 justify-between mb-4">
        <tiny-button-group
          v-model="filterDataModel.classify"
          :data="serviceOptions"
          @change="classifyChange"
        ></tiny-button-group>
        <div class="flex flex-wrap gap-2">
          <div class="search-box-container">
            <tiny-search
              v-model="filterDataModel.keyWords"
              :placeholder="$t('searchTable.form.placeholder')"
              @change="handleRefresh"
            ></tiny-search>
          </div>
          <tiny-button class="ml-2" :icon="IconRefresh" @click="handleRefresh">
          </tiny-button>
          <tiny-button :icon="IconSetting"> </tiny-button>
        </div>
      </div>

      <div id="card-list" class="flex gap-2 flex-wrap">
        <tiny-card v-for="card in cards" :key="card.id">
          <Image :src="card.icon" />
          <div class="header mt2 mb-2">{{ card.name }}</div>
          <div class="line-clamp-2">{{ card.description }}</div>
          <div class="mt2">
            <tiny-tag
              v-for="(item, index) in card.tag"
              class="mr-1"
              :key="index"
              :type="item.type"
              :value="item.value"
            ></tiny-tag>
          </div>
        </tiny-card>
      </div>
      <tiny-pager
        :current-page="pager.currentPage"
        :total="pager.total"
        :page-size="pager.pageSize"
        :page-sizes="pager.pageSizes"
        @current-change="currentChange"
        @size-change="sizeChange"
        layout="total, sizes, pre, pager, next, jumper"
      ></tiny-pager>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { onMounted, reactive, ref } from 'vue';
  import { t } from '@opentiny/vue-locale';
  import {
    TinyButton,
    TinyButtonGroup,
    TinySearch,
    TinyCard,
    TinyTag,
    TinyPager,
    TinyLoading,
  } from '@opentiny/vue';
  import { iconRefresh, iconSetting } from '@opentiny/vue-icon';
  import { getServicesList } from '@/api/card';
  import Image from './components/image.vue';

  const IconRefresh = iconRefresh();
  const IconSetting = iconSetting();
  const serviceOptions = reactive([
    { text: t(`cardList.options.all`), value: 'all' },
    { text: t(`cardList.options.services`), value: 'service' },
    { text: t(`cardList.options.design`), value: 'design' },
  ]);
  const filterDataModel = reactive({
    keyWords: '',
    classify: 'all',
  });
  let cards = ref([]);
  let cardLoadingState = ref(null);

  let pager = ref({
    currentPage: 1,
    pageSize: 10,
    total: 2,
    pageSizes: [10, 20, 50],
  });

  onMounted(() => {
    fetchData();
  });

  function handleRefresh() {
    fetchData();
  }

  function classifyChange(val) {
    filterDataModel.classify = val;
    fetchData();
  }

  function currentChange(current) {
    pager.value.currentPage = current;
    fetchData();
  }

  function sizeChange(size) {
    pager.value.pageSize = size;
    fetchData();
  }

  async function fetchData() {
    const queryParmas = {
      pageIndex: pager.value.currentPage,
      pageSize: pager.value.pageSize,
      ...filterDataModel,
    };

    try {
      cardLoadingState.value = TinyLoading.service({
        target: document.getElementById('card-list'),
      });
      const { data } = await getServicesList(queryParmas);
      cards.value = data.data;
      pager.value.total = data.total;
    } finally {
      cardLoadingState.value.close();
    }
  }
</script>
<style scoped lang="less">
  .content {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    height: 100%;
    overflow: auto;
    background: #fff;
    border-radius: 10px;
    padding: 20px;
  }

  .header {
    color: var(--tv-color-text);
    font-weight: bold;
    font-size: 16px;
  }

  .search-box-container {
    width: 300px;
  }
</style>
