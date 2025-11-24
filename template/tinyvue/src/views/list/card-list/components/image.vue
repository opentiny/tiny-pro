<template>
  <img :src="url" class="img" />
</template>
<script lang="ts" setup>
  import { computed, defineProps } from 'vue';

  const props = defineProps({ src: String });

  const url = computed(() => `/src/assets/images/${props.src}`);
</script>
<style scoped lang="less">
  .img {
    width: 40px;
    height: 40px;
  }
</style>
