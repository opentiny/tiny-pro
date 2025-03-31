<template>
  <div class="container">
    <Breadcrumb :items="['menu.user', 'menu.user.info']" />
    <div class="container-info">
      <div class="general-card">
        <div class="general-top">
          <headtop></headtop>
        </div>
        <div class="general-content">
          <infotab></infotab>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import infotab from './components/info-tab.vue';
  import headtop from '../../form/step/components/head.vue';
</script>

<style scoped lang="less">
  .container {
    width: 100%;
    height: calc(100% - 48px);
  }

  .container-info {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: 100%;
    height: calc(100% - 60px);
    margin: 0 auto;

    .general-card {
      flex: 1 1 auto;
      height: 100%;
      border-radius: 10px;

      .general-top {
        display: flex;
        justify-content: space-around;
        margin: 10px -10px;
        background-image: url('@/assets/images/step-head.png');
        background-size: cover;
      }

      .general-content {
        position: relative;
        height: calc(100% - 198px);
        color: black;
        font-size: medium;
        background-color: #fff;
        border-radius: 10px;
        box-shadow: 0 0 8px 8px rgba(169, 174, 184, 0.05);
      }
    }
  }
</style>
