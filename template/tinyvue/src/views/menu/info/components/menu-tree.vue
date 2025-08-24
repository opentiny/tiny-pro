<template>
  <tiny-grid  
    ref="grid" 
    :data="menuList" 
    :tree-config="{ children: 'children' }"
    align="center"
    :size="gridSize"
    >
    <tiny-grid-column 
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
          {{ row.customIcon }}
      </template>
    </tiny-grid-column>
    <tiny-grid-column field="component" :title="$t('menuInfo.table.component')"></tiny-grid-column>
    <tiny-grid-column field="url"  :title="$t('menuInfo.table.path')" ></tiny-grid-column>
    <tiny-grid-column field="locale"  :title="$t('menuInfo.table.locale')"></tiny-grid-column>
    <tiny-grid-column :title="$t('permissionInfo.table.operations')" width="200" >
      <template #default="{ row }">
        <iconEdit class="del-icon"></iconEdit>
        <a
          v-permission="'menu::update'"
          class="operation-update"
          @click="emits('update', row)"
        >
          {{ $t('menuInfo.table.operations.update') }}
        </a>
        <tiny-popconfirm :title="$t('menuInfo.modal.title.confirm')" type="warning" trigger="click" @confirm="confirm(row)">
          <template #reference>
            <iconDel class="del-icon"></iconDel>
            <a
              v-permission="'menu::remove'"
              class="operation-update"
            >
              {{ $t('menuInfo.table.operations.delete') }}
          </a>
          </template>
        </tiny-popconfirm>

      </template>
    </tiny-grid-column>
  </tiny-grid>
</template>

<script lang="ts" setup>
  import { watch,ref } from 'vue';
  import { IconDel, IconEdit } from '@opentiny/vue-icon';
  import { ITreeNodeData } from '@/router/guard/menu';
  import { TinyGrid, TinyGridColumn ,TinyPopconfirm  } from '@opentiny/vue';
  import { useResponsiveGrid } from '@/hooks/responsive'

  const { gridSize } = useResponsiveGrid()
  
  export type Node = {
    data: ITreeNodeData;
    children: Node[];
  };
  const props = defineProps<{
    data: ITreeNodeData[];
    localeData: { value: string; label: string }[];
  }>();
  const iconDel = IconDel();
  const menuList = ref([])
  const iconEdit = IconEdit();
  const emits = defineEmits<{
    check: [Node];
    update: [Node];
    delete: [Node];
  }>();

  const confirm = (row) =>{
    emits('delete', row)
  }
  watch(
      () => props.data.length,
      () => {
          menuList.value = props.data
      },
      { immediate: true },
    );
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
  .del-icon{
    fill: #1890ff;
    margin-right: 8px;
    font-size: 16px;
    margin-top: -3px;
  }

  .operation-update:hover{
    text-decoration: underline;
  }
</style>
