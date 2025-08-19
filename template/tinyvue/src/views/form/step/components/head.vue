<template>
  <div class="user w-[16%] max-md:w-[25%] max-sm:w-[100%] max-md:ml-[5%] max-sm:justify-center max-sm:gap-6 max-sm:mt-[5%]">
    <transition-fade-down-group>
      <img src="@/assets/images/user-head.png" alt="user" class="user-image max-md:h-[50%] max-sm:h-[70%]" />
      <div>
        <transition-fade-down-group>
          <h3 class="user-name text-[18px] pl-[26px] max-sm:pl-[0px]">{{ $t('stepForm.head.admin') }}</h3>
          <h3 class="user-name text-[18px] pl-[26px] max-sm:pl-[0px]">{{ userStore.userInfo.name }}</h3>
        </transition-fade-down-group>  
      </div>
    </transition-fade-down-group>
  </div>
  <div class="divider my-auto w-[1px] h-[50%] max-sm:w-[60%] max-sm:h-[1px] max-sm:smx-auto max-md:mx-[2%] max-sm:my-[2%]"></div>
  <div class="user-content pb-[8px] max-sm:pb-[20px] max-sm:mt-[10px]">
    <tiny-layout>
      <tiny-row justify="center" class="margin-bottom flex flex-wrap">
        <transition-fade-down-group>
          <img src="@/assets/images/head-1.png" class="head-image" />
          <tiny-col class="w-[calc((100%-140px)/3)] max-md:w-[calc((100%-94px)/2)] max-sm:w-[calc(100%-50px)]">
            <div class="col">
              <div>{{ $t('stepForm.recruitment.department') }}</div>
              <div class="space"></div>
              <div>{{ userStore.userInfo.department }}</div>
            </div>
          </tiny-col>
          <img src="@/assets/images/head-2.png" class="head-image" />
          <tiny-col class="w-[calc((100%-140px)/3)] max-md:w-[calc((100%-94px)/2)] max-sm:w-[calc(100%-50px)]">
            <div class="col">
              <div>{{ $t('stepForm.recruitment.type') }}</div>
              <div class="space"></div>
              <div>{{ userStore.userInfo.employeeType }}</div>
            </div>
          </tiny-col>
          <img src="@/assets/images/head-3.png" class="head-image" />
          <tiny-col class="w-[calc((100%-140px)/3)] max-md:w-[calc((100%-94px)/2)] max-sm:w-[calc(100%-50px)]">
            <div class="col">
              <div>{{ $t('stepForm.recruitment.position') }}</div>
              <div class="space"></div>
              <div>{{ userStore.userInfo.job }}</div>
            </div>
          </tiny-col>
          <img src="@/assets/images/head-4.png" class="head-image" />
          <tiny-col class="w-[calc((100%-140px)/3)] max-md:w-[calc((100%-94px)/2)] max-sm:w-[calc(100%-50px)]">
            <div class="col">
              <div>{{ $t('stepForm.probation.start') }}</div>
              <div class="space"></div>
              <div>
                {{ userStore.userInfo.probationStart }}
                ~
                {{ userStore.userInfo.probationEnd }}
              </div>
            </div>
          </tiny-col>
          <img src="@/assets/images/head-5.png" class="head-image" />
          <tiny-col class="w-[calc((100%-140px)/3)] max-md:w-[calc((100%-94px)/2)] max-sm:flex-col max-sm:w-[calc(100%-50px)]">
            <div class="col">
              <div>{{ $t('stepForm.start.date') }}</div>
              <div class="space"></div>
              <div>{{ userStore.userInfo.protocolStart }}</div>
            </div>
          </tiny-col>
          <img src="@/assets/images/head-6.png" class="head-image" />
          <tiny-col class="w-[calc((100%-140px)/3)] max-md:w-[calc((100%-94px)/2)] max-sm:flex-col max-sm:w-[calc(100%-50px)]">
            <div class="col">
              <div>{{ $t('stepForm.probation.period') }}</div>
              <div class="space"></div>
              <div
                >{{ userStore.userInfo.probationDuration
                }}{{ $t('stepForm.probation.day') }}</div
              >
            </div>
          </tiny-col>
        </transition-fade-down-group>
      </tiny-row>
    </tiny-layout>
  </div>
</template>

<script lang="ts" setup>
  import { onMounted } from 'vue';
  import {
    Layout as TinyLayout,
    Row as TinyRow,
    Col as TinyCol,
  } from '@opentiny/vue';
  import { useUserStore } from '@/store';

  const userStore = useUserStore();
</script>

<style scoped lang="less">
  .user-content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 66%;
  }

  .divider {
    background: #fff;
    opacity: 0.3;
  }

  .user {
    display: flex;
    align-items: center;
  }

  .user-image {
    font-style: oblique;
    border-radius: 60px;
    fill: var(--tv-common-color-line-active);
  }

  .space {
    height: 10px;
  }

  .head-image {
    margin-top: 6px;
    padding-right: 10px;
    margin-bottom: 10px
  }

  .user-name {
    color: #fff;
    font-weight: 600;
  }

  .margin-bottom {
    margin-top: 15px;
    margin-bottom: 15px;
  }

  .col {
    color: #fff;
  }
</style>

<style lang="less" scoped>
</style>
