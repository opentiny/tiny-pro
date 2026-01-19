<script lang="ts" setup>
import { computed } from 'vue'

const props = defineProps({
  src: {
    type: String,
    default: 'card-list-application-default.png',
  },
})

const url = computed(
  () => new URL(`../../../../assets/images/${props.src}`, import.meta.url).href,
)
</script>

<template>
  <img :src="url" class="img" alt="">
</template>

<style scoped lang="less">
  .img {
  width: 32px;
  height: 32px;
}
</style>
