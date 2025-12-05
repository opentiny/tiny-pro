<template lang="">
  <div>
    <TinyTag v-if="value" :value="value" :type="type"> </TinyTag>
    <div v-else>--</div>
  </div>
</template>
<script setup>
  import { TinyTag } from '@opentiny/vue';
  import { computed } from 'vue';

  const props = defineProps({
    value: String,
  });

  const tagType = {
    running: 'info',
    finished: 'success',
    delayed: 'warning',
  };

  const type = computed(() => {
    return tagType[props.value];
  });
</script>
<style lang=""></style>
