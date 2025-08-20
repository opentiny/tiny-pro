<template>
  <div class="contain">
    <tiny-transfer
      ref="targetFormRef"
      v-model="targetModel"
      :data="targetData"
      :titles="[$t('stepForm.target.list'), $t('stepForm.target.sure')]"
    ></tiny-transfer>
  </div>
</template>

<script lang="ts" setup>
  import { ref, reactive, defineExpose } from 'vue';
  import { Transfer as TinyTransfer } from '@opentiny/vue';

  interface data {
    key: number;
    label: string;
    disabled: boolean;
  }

  // 初始化请求数据
  const targetFormRef = ref();
  const targetData: data[] = reactive([]);
  for (let i = 0; i <= 15; i += 1) {
    targetData.push({
      key: i,
      label: `Options ${i}`,
      disabled: false,
    });
  }

  const targetModel = ref([]);

  const targetSubmit = () => {
    if (targetModel.value?.length) {
      targetData.forEach((item) => {
        item.disabled = true;
      });
      return true;
    }
    return false;
  };

  const targetReset = () => {
    targetModel.value = [];
  };

  defineExpose({
    targetReset,
    targetSubmit,
    targetModel,
  });
</script>

<style scoped lang="less">
  .contain {
    display: flex;
    justify-content: start;
    padding-left: 14px;
    padding-bottom: 24px;
  }
</style>
