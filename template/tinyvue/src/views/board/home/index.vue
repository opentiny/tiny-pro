<script lang="ts" setup>
import Curve from './components/curve.vue'
import Falls from './components/falls.vue'
import Main from './components/main.vue'
import Region from './components/region.vue'
import Round from './components/round.vue'
</script>

<template>
  <div class="container">
    <Breadcrumb :items="['menu.board', 'menu.home']" />
    <div class="contain">
      <Main />
      <Curve />
      <Falls />
      <Round />
      <Region />
    </div>
  </div>
</template>

<style scoped lang="less">
  .container {
  width: 100%;
  height: calc(100% - 60px);
  margin: 0 auto;
  overflow-x: hidden;
  overflow-y: auto;
}
</style>

<style lang="less" scoped>
  // responsive
@media (max-width: @screen-xs) {
  .container {
    overflow-x: hidden;
  }
}
</style>
