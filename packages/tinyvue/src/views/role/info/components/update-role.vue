<script lang="ts" setup>
  import {
    Modal as TinyModal,
    Form as TinyForm,
    FormItem as TinyFormItem,
    Input as TinyInput,
    BaseSelect as TinyBaseSelect,
    Option as TinyOption,
    Button as TinyButton,
  } from '@opentiny/vue';
  import { reactive, ref, watch } from 'vue';
  import { Permission } from '@/api/permission';
  import { updateRole } from '@/api/role';
  import useLoading from '@/hooks/loading';
  import { useI18n } from 'vue-i18n';
  import { useRouter, useRoute } from 'vue-router';
  import { RoleAddData } from './add-role.vue';

  export type UpdateRoleData = Partial<RoleAddData> & { id: number };
  const { loading, setLoading } = useLoading();
  const router = useRouter();
  const route = useRoute();
  const emits = defineEmits<{
    close: [];
    confirm: [UpdateRoleData];
  }>();
  const props = defineProps<{
    data: Partial<RoleAddData> & { id: number };
    permissions: Permission[];
    visible: boolean;
  }>();
  const visible = ref(props.visible);
  const updateData = ref({
    ...props.data,
  });
  watch(
    props,
    () => {
      visible.value = props.visible;
      updateData.value = { ...props.data };
    },
    { deep: true },
  );
  const { t } = useI18n();
  const componentKey = ref(0);
  const onUpdate = () => {
    setLoading(true);
    updateRole(updateData.value)
      .then(({ data }) => {
        TinyModal.message({
          message: t('baseForm.form.submit.success'),
          status: 'success',
        });
        emits('confirm', data);
        router.go(0);
      })
      .catch((error) => {
        if (error.response && error.response.data) {
          const errorMessage = error.response.data.message || '未知错误';
          TinyModal.message({
            message: errorMessage,
            status: 'error',
          });
        }
      })
      .finally(() => {
        setLoading(false);
        emits('close');
      });
  };
  const onCancel = () => {
    emits('close');
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
    width="600"
    :title="$t('roleInfo.modal.title.update')"
    @close="() => emits('close')"
  >
    <tiny-form :model="updateData" label-position="top">
      <tiny-form-item :label="$t('roleInfo.modal.input.id')">
        <label>{{ updateData.id }}</label>
      </tiny-form-item>
      <tiny-form-item :label="$t('roleInfo.modal.input.name')" prop="name">
        <tiny-input v-model="updateData.name"></tiny-input>
      </tiny-form-item>
      <tiny-form-item :label="$t('roleInfo.modal.input.desc')" prop="desc">
        <tiny-base-select
          v-model="updateData.permissionIds"
          :placeholder="$t('baseForm.form.label.placeholder')"
          multiple
        >
          <tiny-option
            v-for="item in props.permissions"
            :key="item.id"
            :label="$t(item.name)"
            :value="item.id"
          ></tiny-option>
        </tiny-base-select>
      </tiny-form-item>
    </tiny-form>
    <template #footer>
      <tiny-button type="primary" :loading="loading" @click="onUpdate">{{
        $t('menu.btn.confirm')
      }}</tiny-button>
      <tiny-button :loading="loading" @click="onCancel">{{
        $t('menu.btn.cancel')
      }}</tiny-button>
    </template>
  </tiny-modal>
</template>
