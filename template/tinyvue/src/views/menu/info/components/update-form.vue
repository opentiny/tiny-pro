<template>
  <tiny-form
    ref="updateForm"
    :display-only="props.readonly"
    :rules="rules"
    :model="menuInfo"
    label-position="top"
  >
    <tiny-form-item :label="$t('menuInfo.table.name')" prop="locale">
      <tiny-select
        v-model="menuInfo.locale"
        :placeholder="$t('baseForm.form.label.placeholder')"
        filterable
        no-match-text="No Match"
        :options="props.localeData"
        optimization
      >
      </tiny-select>
    </tiny-form-item>
    <tiny-form-item
      prop="oldLabel"
      :label="$t('menuInfo.table.id')"
      :extra="$t('menuInfo.modal.tips.upd-id')"
    >
      <tiny-input v-model="menuInfo.oldLabel" />
    </tiny-form-item>
    <tiny-form-item :label="$t('menuInfo.table.order')" prop="order">
      <tiny-input v-model="menuInfo.order"></tiny-input>
    </tiny-form-item>
    <tiny-form-item :label="$t('menuInfo.table.parentId')" prop="parentId">
      <tiny-select
        v-model="menuInfo.parentId"
        value-field="id"
        text-field="label"
        render-type="tree"
        :tree-op="treeOp"
        clearable
      >
      </tiny-select>
    </tiny-form-item>
    <tiny-form-item :label="$t('menuInfo.table.icon')" prop="icon">
      <tiny-select
        v-model="menuInfo.icon"
        :placeholder="$t('baseForm.form.label.placeholder')"
        filterable
        no-match-text="No Match"
        :options="iconDatas"
        optimization
      ></tiny-select>
    </tiny-form-item>
    <tiny-form-item :label="$t('menuInfo.table.component')" prop="component">
      <tiny-input v-model="menuInfo.component"></tiny-input>
    </tiny-form-item>
    <tiny-form-item :label="$t('menuInfo.table.path')" prop="url">
      <tiny-input v-model="menuInfo.url"></tiny-input>
    </tiny-form-item>
  </tiny-form>
</template>

<script lang="ts" setup>
  import {
    Form as TinyForm,
    FormItem as TinyFormItem,
    Input as TinyInput,
    Select as TinySelect,
  } from '@opentiny/vue';
  import { ITreeNodeData } from '@/router/guard/menu';
  import { computed, reactive, ref, unref , h} from 'vue';
  import { useDeepClone } from '@/hooks/useDeepClone';
  import { icons } from '@opentiny/icons/json/icons.json';

  const props = defineProps<{
    node: ITreeNodeData;
    menus: ITreeNodeData[];
    localeData: { value: string; label: string }[];
    readonly: boolean;
  }>();

  // 校验规则
  const rulesType = {
    required: true,
    trigger: 'blur',
  };
  const rulesSelect = {
    required: true,
    message: '必选',
    trigger: 'blur',
  };
  const rules = computed(() => {
    return {
      oldLabel: [rulesType],
      order: [rulesType],
      component: [rulesType],
      url: [rulesType],
      locale: [rulesSelect],
    };
  });

  const coverToTree = (data: ITreeNodeData[]) => {
    if (!data.length) {
      return undefined;
    }
    const menus = useDeepClone(data);
    const ret = [];
    for (let i = 0; i < menus.length; i += 1) {
      const menu = menus[i];
      ret.push({
        value: menu.id,
        label: menu.label,
        children: coverToTree(menu.children),
      });
    }
    return ret;
  };

  const treeOp = computed(() => ({ data: props.menus }));
  const updateForm = ref();
  const menuInfo = reactive<ITreeNodeData>({
    id: props.node.id,
    label: props.node.label,
    url: props.node.url,
    component: props.node.component,
    icon: props.node.customIcon,
    menuType: props.node.menuType,
    parentId: props.node.parentId,
    order: props.node.order,
    locale: props.node.locale,
    oldLabel: props.node.oldLabel,
  });
  const iconDatas = Object.keys(icons).map((key) => {
    return {
      label: key,
      value: key,
      icon: h('i', { class: `ci-${key}`, style: { fontSize: '18px',  marginRight: '6px' } }),
    };
  });

  const getMenuInfo = () => {
    return {
      ...unref(menuInfo),
      parentId:
        (menuInfo.parentId as string | number) === '' ||
        menuInfo.parentId === null
          ? null
          : menuInfo.parentId,
    } as ITreeNodeData;
  };
  defineExpose({
    getMenuInfo,
    valid: async () => updateForm.value.validate(),
  });
</script>

<style scoped>
  :deep(.font-14-css) {
    font-size: 12px;
  }
</style>
