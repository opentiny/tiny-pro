<template>
  <div class="content">
    <h1>404</h1>
    <div>{{ $t('exception.result.404.description') }}</div>
  </div>
</template>

<script lang="ts" setup>
  import { onMounted } from 'vue';
  import { useRouter } from 'vue-router';

  const router = useRouter();

  const back = () => {
    // warning： Go to the node that has the permission
    router.push({ name: 'Home' });
  };
  onMounted(() => {
    setTimeout(() => {
      back();
    }, 1000);
  });
</script>

<style scoped lang="less">
  .content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100vh;
    margin: 0;
    padding: 0;
  }
</style>
