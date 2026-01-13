<template>
    <div class="container">
        <Breadcrumb :items="['menu.exception', 'menu.exception.load-failure']" />
        <div class="content">
            <div class="content-main">
                <img src="@/assets/images/load-failure.svg?url" alt="load failure" class="image" />
                <h3 class="tip">{{ $t('exception.result.load-failure.description') }}</h3>
                <span>{{ $t('exception.result.permissions.load-failure') }}</span>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup></script>

<style scoped lang="less">
@import '@/assets/style/exception.less';
/* 引入公共样式 */
</style>
