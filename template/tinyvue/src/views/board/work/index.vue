<template>
  <div class="container-work">
    <Breadcrumb :items="['menu.board', 'menu.work']" />
    <div class="work-image">
      <transition-slide>
        <img src="@/assets/images/woker.png" alt="403" class="user-image" />
      </transition-slide>
    </div>
    <div class="content">
      <div class="left">
        <div class="card">
          <div class="card-title">{{ $t('work.index.learn') }}</div>
          <div>
            <learnplan></learnplan>
          </div>
        </div>
        <div class="card">
          <div class="card-title">{{ $t('work.index.trainees') }}</div>
          <div class="card-title card-coach">{{ $t('work.index.coachNum') }}</div>
          <div>
            <learncoach></learncoach>
          </div>
        </div>
        <div class="card-center">
          <div class="card card-issue">
            <div class="card-title">{{ $t('work.index.formalization') }}</div>
            <learnprobation></learnprobation>
          </div>
          <div class="card card-home">
            <div class="card-title">{{ $t('work.index.Home') }}</div>
            <div v-for="item in Home" :key="item" class="home-title">
              <span :class="{'dt-icon':true,'is-old':item?.isOld}"></span>
              <span>{{ $t(item.label) }}</span>
              <span v-if="item.value" class="home-tip">{{ $t(item.value) }}</span>
            </div>
          </div>
        </div>
        <div class="card">
            <div class="card-title">{{ $t('work.index.collect') }}</div>
            <learntrain></learntrain>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import transitionFadeDownGroup from '@/components/transition/transition-fade-down-group.vue';
import learnplan from './components/learn-plan.vue';
import learncoach from './components/learn-coach.vue';
import learnprobation from './components/learn-probation.vue';
import learnpracticed from './components/learn-practiced.vue';
import learntrain from './components/learn-traini.vue';


const Home = [
  { label: 'work.index.Brave', value: 'work.index.Growth' },
  { label: 'work.index.Termbase',  value: ''},
  { label: 'work.index.Library',  value: '' ,isOld : true},
];
</script>

<style scoped lang="less">
.container-work {
  width: 100%;
  height: 100%;
  padding: 24px;
  overflow: auto;
  background: #f6f8f9;
  color: #191919;

  .work-image {
    width: 100%;
    margin: 0 auto;

    img {
      width: 100%;
      min-height: 50px;
    }
  }
}

.content {
  display: flex;
  justify-content: space-between;
  padding-bottom: 10px;

  .font {
    padding: 12px 8px;
    color: #575d6c;
    font-size: 16px;
    line-height: 14px;
  }

  .left {
    width: 100%;

    .card {
      display: flex;
      flex-direction: column;
      min-height: 200px;
      background-color: #fff;
      margin-top: 16px;
      padding: 24px;
      border-radius: 8px;
      position: relative;

      .card-title {
        height: 24px;
        line-height: 24px;
        font-size: 16px;
        font-weight: 700;
        margin-bottom: 16px;
      }
      .card-coach{
        position: absolute;
        top: 24px;
        left: calc(50% + 24px);
      }
    }

    .card-center {
      display: flex;
      gap: 24px;
      width: 100%;
      height: 200px;
      margin-top: 16px;
      border-radius: 8px;

      .card-issue {
        margin-top: 0px;
        flex: 3;
        /* 比例3:1实现75%-25%分配 */
      }

      .card-home {
        margin-top: 0px;
        flex: 1;
        span:hover{
          text-decoration: underline;
        }
      }
    }
  }

  .right {
    width: 19%;
    padding-right: 10px;

    h3 {
      .font();
    }

    .more {
      min-height: 369px;
    }

    .less {
      min-height: 156px;
    }

    .card {
      display: flex;
      flex-direction: column;
      justify-content: space-evenly;
      padding: 20px;
      color: #010407;
      background: #fff;
      border-radius: 10px;
      box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.05);

    }

    .card:hover {
      box-shadow: 0 3px 10px 0 rgb(64 98 225 / 45%);
    }
  }
}

.col>span {
  display: flex;
  flex-direction: column;
  padding: 10px 10px;
  text-align: center;
}

.col>span:first-child {
  color: #010407;
  font-weight: 500;
}

.col>span:last-child {
  font-weight: 900;
  font-size: large;
}

.home-title {
  display: flex;
  height: 22px;
  line-height: 22px;
  margin-bottom: 20px;

  .dt-icon {
    width: 8px;
    height: 8px;
    border-radius: 8px;
    background: #f23030;
    margin-top: 7px;
    margin-right: 16px;
  }
  .is-old{
    background: #ff8800;
  }

  .home-tip {
    height: 18px;
    line-height: 18px;
    color: #1476ff;
    background: #DEECFF;
    margin-top: 2px;
    margin-left: 8px;
    font-size: 12px;
    padding: 0 4px;
  }
}
</style>
