<template>
  <tiny-modal 
  v-model="visible"
   width="700"  
   height="auto" 
   :title="$t('roleInfo.table.bind')" 
   show-footer @close="() => emits('close')">
   <div class="menu-input">
    <tiny-input v-model="filterText" :placeholder="$t('setting.input.search')"  @input="inputChange"></tiny-input>
  </div>
    <tiny-tree 
    ref="treeRef" 
    :shrink-icon="shrinkIcon" 
    shrink-icon-color="#5291FF" 
    node-key="id" 
    :expand-icon="expandIcon"
    expand-icon-color="#5291FF"
    :data="menus" 
    :filter-node-method="filterNodeMethod"
    show-checkbox />
    <template #footer>
      <tiny-button round @click="() => emits('close')">{{
        $t('menu.btn.cancel')
      }}</tiny-button>
      <tiny-button round  type="primary"  @click="onConfirm">
        {{ $t('menu.btn.confirm') }}
      </tiny-button>
    </template>
  </tiny-modal>
</template>

<script setup lang="ts">
  import type { ITreeNodeData } from '@/router/guard/menu';
  import { Modal as TinyModal, TinyTree , Button as TinyButton,TinyInput } from '@opentiny/vue';
  import { onMounted, ref, toRefs, watch } from 'vue';
  import { iconExpand ,iconPutAway } from '@opentiny/vue-icon'

  const props = defineProps<{
    visible: boolean;
    menus: ITreeNodeData[];
    selectedId: number[];
  }>();
  const shrinkIcon = iconExpand()
  const expandIcon = iconPutAway()
  const filterText = ref('')
  const emits = defineEmits<{
    (event: 'close'): void;
    (event: 'confirm', ids: number[]): void;
  }>();
  const { menus, selectedId } = toRefs(props);
  const treeRef = ref();
  const visible = ref(props.visible);
  const onConfirm = () => {
    const keys = [
      ...treeRef.value.getHalfCheckedKeys(),
      ...treeRef.value.getCheckedKeys(),
    ];
    emits('confirm', keys);
  };
  const inputChange = () =>  {
    treeRef.value.filter(filterText.value)
  };

  const filterNodeMethod = (text, data, node) =>  {
    return data.label.includes(text)
  }

  onMounted(() => {
    selectedId.value.forEach((id) => {
      treeRef.value.setChecked(id, true, false);
    });
  });
</script>
