<script setup>
import { computed } from 'vue'

const props = defineProps({
  data: Object,
  options: Array,
  field: String,
})
const tranformValue = computed(() => {
  return (
    props.options.find(item => item.value === props.data.row[props.field])
      ?.label ?? '--'
  )
})
</script>

<template lang="">
  <div>{{ tranformValue }} </div>
</template>

<style lang=""></style>
