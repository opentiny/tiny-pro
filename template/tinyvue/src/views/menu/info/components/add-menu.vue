<template>
  <tiny-form
    ref="menuForm"
    :rules="rules"
    :model="menuInfo"
  >
    <tiny-row>
      <tiny-col :span="6">
        <tiny-form-item :label="$t('menuInfo.table.name')" prop="name">
          <tiny-input v-model="menuInfo.name"></tiny-input>
        </tiny-form-item>
      </tiny-col>
      <tiny-col :span="6">
        <tiny-form-item :label="$t('menuInfo.table.order')" prop="order">
          <tiny-input v-model="menuInfo.order"></tiny-input>
        </tiny-form-item>
      </tiny-col>
      <tiny-col :span="6">
        <tiny-form-item :label="$t('menuInfo.table.parentId')" prop="parentId">
          <tiny-select
            v-model="menuInfo.parentId"
            :placeholder="$t('baseForm.form.label.placeholder')"
            value-field="id"
            text-field="label"
            render-type="tree"
            :tree-op="treeSelectMenu"
            clearable
          >
          </tiny-select>
        </tiny-form-item>
      </tiny-col>
      <tiny-col :span="6">
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
      </tiny-col>
      <tiny-col :span="6">
        <tiny-form-item :label="$t('menuInfo.table.component')" prop="component">
          <tiny-input v-model="menuInfo.component"></tiny-input>
        </tiny-form-item>
      </tiny-col>
      <tiny-col :span="6">
        <tiny-form-item :label="$t('menuInfo.table.path')" prop="path">
          <tiny-input v-model="menuInfo.path"></tiny-input>
        </tiny-form-item>
      </tiny-col>
      <tiny-col :span="6">
        <tiny-form-item :label="$t('menuInfo.table.locale')" prop="locale">
          <tiny-select
            v-model="menuInfo.locale"
            :placeholder="$t('baseForm.form.label.placeholder')"
            filterable
            no-match-text="No Match"
            :options="locales"
            optimization
          >
          </tiny-select>
        </tiny-form-item>
      </tiny-col>
    </tiny-row>
  </tiny-form>
</template>

<script lang="ts" setup>
  import { CreateMenuDto } from '@/api/menu';
  import { useDeepClone } from '@/hooks/useDeepClone';
  import { ITreeNodeData } from '@/router/guard/menu';
  import {
    Form as TinyForm,
    FormItem as TinyFormItem,
    Input as TinyInput,
    Select as TinySelect,
    Option as TinyOption,
    TinyRow,
    TinyCol
  } from '@opentiny/vue';
  import { icons } from '@opentiny/icons/json/icons.json';
  import { reactive, ref, toRefs, computed, unref, h } from 'vue';

  const props = defineProps<{
    menus: ITreeNodeData[];
    locales: { value: string; label: string }[];
  }>();

  type TreeSelectMenu = {
    label: string;
    id: number;
    children: TreeSelectMenu[];
  };

  const menuForm = ref();

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
      name: [rulesType],
      order: [rulesType],
      component: [rulesType],
      path: [rulesType],
      locale: [rulesSelect],
    };
  });

  const cover = (data: ITreeNodeData[]) => {
    const menus = useDeepClone(data);
    const ans: TreeSelectMenu[] = [];
    const dfs = (menu: ITreeNodeData) => {
      const ret: TreeSelectMenu = {
        label: menu.label,
        id: Number(menu.id),
        children: [],
      };
      for (let i = 0; i < menu.children.length; i += 1) {
        const child = menu.children[i];
        ret.children.push(dfs(child));
      }
      return ret;
    };
    for (let i = 0; i < menus.length; i += 1) {
      const menu = menus[i];
      ans.push(dfs(menu));
    }
    return ans;
  };

  const treeSelectMenu = computed(() => ({ data: cover(props.menus) }));

  const iconDatas = Object.keys(icons).map((key) => {
    return {
      label: key,
      value: key,
      icon: h('i', { class: `ci-${key}`, style: { fontSize: '18px',  marginRight: '6px' } }),
    };
  });

  const menuInfo = reactive<Omit<CreateMenuDto, 'id'>>({
    name: '',
    path: '',
    component: '',
    icon: '',
    menuType: '/',
    parentId: null,
    order: 0,
    locale: '',
  });

  defineExpose({
    getMenuInfo: () => {
      return {
        ...unref(menuInfo),
        parentId:
          (menuInfo.parentId as string | number) === '' ||
          menuInfo.parentId === null
            ? null
            : Number(menuInfo.parentId),
      };
    },
    valid: async () => {
      return menuForm.value.validate();
    },
  });
</script>
