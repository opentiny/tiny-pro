<script lang="ts" setup>
  import { Permission } from '@/api/permission';
  import {
    Modal as TinyModal,
    Form as TinyForm,
    FormItem as TinyFormItem,
    Input as TinyInput,
    Option as TinyOption,
    Select as TinySelect,
    Button as TinyButton,
  } from '@opentiny/vue';
  import { computed, reactive, ref, unref, watch } from 'vue';

  export type RoleAddData = {
    name: string;
    permissionIds: number[];
    menuIds: number[];
  };
  const data = reactive<RoleAddData>({
    name: '',
    permissionIds: [],
    menuIds: [],
  });
  const props = defineProps<{
    permissions: Permission[];
    visible: boolean;
  }>();
  const emits = defineEmits<{
    confirm: [RoleAddData];
    cancel: [];
  }>();
  const visible = ref(props.visible);
  watch(
    props,
    () => {
      visible.value = props.visible;
    },
    { deep: true },
  );
  const rulesType = {
    required: true,
    trigger: 'blur',
  };
  const rules = computed(() => {
    return {
      name: [rulesType],
    };
  });
  const form = ref();
  const onCancel = () => {
    emits('cancel');
  };
  const onConfirm = () => {
    form.value
      .validate()
      .then((isValid: boolean) => {
        if (!isValid) {
          return;
        }
        emits('confirm', unref(data));
      })
      .catch();
  };
</script>

<template>
  <tiny-modal
    v-model="visible"
    lock-scroll
    show-header
    show-footer
    mask-closable
    height="auto"
    :title="$t('roleInfo.modal.title.add')"
  >
    <tiny-form ref="form" :model="data" :rules="rules" label-position="top">
      <tiny-form-item :label="$t('roleInfo.modal.input.name')" prop="name">
        <tiny-input v-model="data.name" />
      </tiny-form-item>

      <tiny-form-item
        :label="$t('roleInfo.modal.input.desc')"
        prop="permissionIds"
      >
        <tiny-select
          v-model="data.permissionIds"
          :placeholder="$t('baseForm.form.label.placeholder')"
          multiple
        >
          <tiny-option
            v-for="item in props.permissions"
            :key="item.id"
            :label="$t(item.name)"
            :value="item.id"
          ></tiny-option>
        </tiny-select>
      </tiny-form-item>
    </tiny-form>
    <template #footer>
      <tiny-button type="primary" round  @click="onConfirm">{{
        $t('menu.btn.confirm')
      }}</tiny-button>
      <tiny-button round  @click="onCancel">{{ $t('menu.btn.cancel') }}</tiny-button>
    </template>
  </tiny-modal>
</template>
