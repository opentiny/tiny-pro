<template>
  <tiny-grid  
    ref="grid" 
    :data="props.data" 
    :tree-config="{ children: 'children' }"
    >
    <tiny-grid-column type="selection"  width="40"></tiny-grid-column>
    <tiny-grid-column 
    width="250" 
    field="locale" 
    :title="$t('menuInfo.table.name')" 
    tree-node
    >
      <template #default="{ row }">
          {{ $t(row.locale) }} 
      </template>
    </tiny-grid-column>
    <tiny-grid-column field="id" title="ID"></tiny-grid-column>
    <tiny-grid-column 
      field="parentId"  
      :title="$t('menuInfo.table.parentId')"
      >
    </tiny-grid-column>
    <tiny-grid-column field="order" :title="$t('menuInfo.table.order')"></tiny-grid-column>
    <tiny-grid-column field="customIcon" :title="$t('menuInfo.table.icon')">
      <template #default="{ row }">
        <component :is="row.customIcon"></component>
    </template>
    </tiny-grid-column>
    <tiny-grid-column field="component" :title="$t('menuInfo.table.component')"></tiny-grid-column>
    <tiny-grid-column field="url"  :title="$t('menuInfo.table.path')" ></tiny-grid-column>
    <tiny-grid-column field="locale"  :title="$t('menuInfo.table.locale')"></tiny-grid-column>
    <tiny-grid-column :title="$t('permissionInfo.table.operations')" align="center">
      <template #default="{ row }">
        <a
          v-permission="'menu::update'"
          class="operation-update"
          @click="emits('update', row)"
        >
          {{ $t('menuInfo.table.operations.update') }}
        </a>
        <a
        v-permission="'menu::remove'"
        class="operation-update"
        @click="emits('delete', row)"
      >
        {{ $t('menuInfo.table.operations.delete') }}
      </a>
      </template>
    </tiny-grid-column>
  </tiny-grid>
</template>

<script lang="ts" setup>
  import { computed } from 'vue';

  import { ITreeNodeData } from '@/router/guard/menu';
  import { TinyGrid, TinyGridColumn  } from '@opentiny/vue';
  
  export type Node = {
    data: ITreeNodeData;
    children: Node[];
  };
  const props = defineProps<{
    data: ITreeNodeData[];
    localeData: { value: string; label: string }[];
  }>();
  const treeOp = computed(() => ({ data: props.data }));

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
