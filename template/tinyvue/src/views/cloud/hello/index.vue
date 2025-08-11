<template>
  <div class="container">
    <Breadcrumb :items="['menu.cloud', 'menu.cloud.hello']" />
    <div class="content">
      <text x="40" y="150" class="text-[72px] max-md:text-[42px] max-sm:text-[18px]">{{ text }}</text>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { onMounted, ref } from 'vue';
  import { ApigInfo } from '@/types/global';
  import { HwcClientService } from '@/utils/hwcClient.service';

  const text = ref();
  const helloWorldApigInfo: ApigInfo = {
    apigName: 'apig_hello_world',
    apigGroupName: 'group_hello_world',
  };

  async function getData(): Promise<void> {
    const result = await HwcClientService.apiRequest(
      '',
      {},
      helloWorldApigInfo
    );
    text.value = result?.data;
  }

  onMounted(getData);
</script>

<style scoped lang="less">
  .container {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: 98%;
    height: inherit;
    margin: 0 auto;
    overflow: auto;

    .content {
      height: 100%;
      overflow: auto;
      text-align: center;
      background: #fff;
      border-radius: 10px;

      text {
        width: 1122px;
        height: 100px;
        color: #5e7ce0;
        font-weight: normal;
        line-height: 300px;
        text-align: left;
      }
    }
  }
</style>
