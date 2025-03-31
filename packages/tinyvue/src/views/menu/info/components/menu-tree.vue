<template>
  <tiny-tree
    size="medium"
    :indent="16"
    show-line
    default-expand-all
    :data="props.data"
    :expand-on-click-node="false"
  >
    <template #operation="{ node }">
      <a
        v-permission="'menu::query'"
        class="operation-info"
        @click="emits('check', node)"
      >
        {{ $t('menuInfo.table.operations.info') }}
      </a>
      <a
        v-permission="'menu::update'"
        class="operation-update"
        @click="emits('update', node)"
      >
        {{ $t('menuInfo.table.operations.update') }}
      </a>
      &nbsp;
      <a
        v-permission="'menu::remove'"
        class="operation-delete"
        @click="emits('delete', node)"
      >
        {{ $t('menuInfo.table.operations.delete') }}
      </a>
    </template>
  </tiny-tree>
</template>

<script lang="ts" setup>
  import { ITreeNodeData } from '@/router/guard/menu';
  import { Tree as TinyTree } from '@opentiny/vue';

  export type Node = {
    data: ITreeNodeData;
    children: Node[];
  };
  const props = defineProps<{
    data: ITreeNodeData[];
  }>();

  const emits = defineEmits<{
    check: [Node];
    update: [Node];
    delete: [Node];
  }>();
</script>

<style scoped lang="less">
  .operation {
    &-delete {
      padding-right: 10px;
      color: red;
    }

    &-update {
      padding-right: 5px;
      color: #1890ff;
    }

    &-info {
      padding-right: 10px;
      color: orange;
    }
  }
</style>
