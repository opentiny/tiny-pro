<template>
  <img :src="url" class="img" />
</template>
<script lang="ts" setup>
  import { computed, defineProps } from 'vue';

  const props = defineProps({
    src: {
      type: String,
      default: 'card-list-application-default.png',
    },
  });

  const url = computed(() => `/src/assets/images/${props.src}`);
</script>
<style scoped lang="less">
  .img {
    width: 32px;
    height: 32px;
  }
</style>
