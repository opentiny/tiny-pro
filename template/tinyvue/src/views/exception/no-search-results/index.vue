<template>
    <div class="container">
        <Breadcrumb :items="['menu.exception', 'menu.exception.no-search-results']" />
        <div class="content">
            <div class="content-main">
                <img src="@/assets/images/no-search-results.svg?url" alt="no search results" class="image" />
                <h3 class="tip">{{ $t('exception.result.no-search-results.description') }}</h3>
                <span>{{ $t('exception.result.permissions.no-search-results') }}</span>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup></script>

<style scoped lang="less">
@import '@/assets/style/exception.less';
/* 引入公共样式 */
</style>
