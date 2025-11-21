<template>
    <div>
        <Breadcrumb :items="['menu.list', 'menu.list.cardList']" />
         <div class="content">
            <tiny-card title="card">
                <p>content</p>
            </tiny-card>
         </div>
    </div>
</template>
<script lang="ts" setup>
    

</script>
<style  scoped lang="less">
    .content {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        height: 100%;
        overflow: auto;
        background: #fff;
        border-radius: 10px;
        padding:20px;
    }
</style>

