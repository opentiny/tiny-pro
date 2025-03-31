<template>
  <div class="container">
    <Breadcrumb :items="['menu.board', 'menu.home']" />
    <div class="contain">
      <Main></Main>
      <Curve></Curve>
      <Falls></Falls>
      <Round></Round>
      <Region></Region>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import transitionFadeDownGroup from '@/components/transition/transition-fade-down-group.vue';
  import Main from './components/main.vue';
  import Curve from './components/curve.vue';
  import Falls from './components/falls.vue';
  import Round from './components/round.vue';
  import Region from './components/region.vue';
</script>

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
