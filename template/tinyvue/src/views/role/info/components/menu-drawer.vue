<template>
  <drawer :visible="visible" show-footer @close="() => emits('close')">
    <tree ref="treeRef" node-key="id" :data="menus" show-checkbox />
    <template #footer>
      <tiny-button @click="onConfirm">
        {{ $t('roleInfo.menuUpdate.confirm') }}
      </tiny-button>
    </template>
  </drawer>
</template>

<script setup lang="ts">
  import type { ITreeNodeData } from '@/router/guard/menu';
  import { Drawer, Tree, Button as TinyButton } from '@opentiny/vue';
  import { onMounted, ref, toRefs, watch } from 'vue';

  const props = defineProps<{
    visible: boolean;
    menus: ITreeNodeData[];
    selectedId: number[];
  }>();

  const emits = defineEmits<{
    (event: 'close'): void;
    (event: 'confirm', ids: number[]): void;
  }>();
  const { visible, menus, selectedId } = toRefs(props);
  const treeRef = ref();

  const onConfirm = () => {
    const keys = [
      ...treeRef.value.getHalfCheckedKeys(),
      ...treeRef.value.getCheckedKeys(),
    ];
    emits('confirm', keys);
  };

  onMounted(() => {
    selectedId.value.forEach((id) => {
      treeRef.value.setChecked(id, true, false);
    });
  });
</script>
