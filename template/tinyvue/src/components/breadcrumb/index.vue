<script lang="ts" setup>
import type { PropType } from 'vue'
import {
  Breadcrumb as TinyBreadcrumb,
  BreadcrumbItem as TinyBreadcrumbItem,
} from '@opentiny/vue'

defineProps({
  items: {
    type: Array as PropType<string[]>,
    default() {
      return []
    },
  },
})
</script>

<template>
  <TinyBreadcrumb class="container-breadcrumb">
    <TinyBreadcrumbItem v-for="item in items" :key="item">
      {{ $t(item) }}
    </TinyBreadcrumbItem>
  </TinyBreadcrumb>
</template>

<style scoped lang="less">
  .container-breadcrumb {
  margin: 16px 0px;
}
</style>
