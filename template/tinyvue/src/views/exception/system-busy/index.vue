<template>
    <div class="container">
        <Breadcrumb :items="['menu.exception', 'menu.exception.system-busy']" />
        <div class="content">
            <div class="content-main">
                <img src="@/assets/images/system-busy.svg?url" alt="system busy" class="image" />
                <h3 class="tip">{{ $t('exception.result.systemBusy.description') }}</h3>
                <span>{{ $t('exception.result.permissions.system-busy') }}</span>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup></script>

<style scoped lang="less">
@import '@/assets/style/exception.less';
/* 引入公共样式 */
</style>
