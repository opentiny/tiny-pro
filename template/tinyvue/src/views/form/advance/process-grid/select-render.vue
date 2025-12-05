<template lang="">
  <div>{{ tranformValue }} </div>
</template>
<script setup>
  import { computed } from 'vue';

  const props = defineProps({
    data: Object,
    options: Array,
    field: String,
  });
  const tranformValue = computed(() => {
    return (
      props.options.find((item) => item.value === props.data.row[props.field])
        ?.label ?? '--'
    );
  });
</script>
<style lang=""></style>
