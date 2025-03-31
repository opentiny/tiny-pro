<template>
  <grid :data="permission">
    <grid-column type="index" width="60"></grid-column>
    <grid-column
      field="desc"
      :title="$t('roleInfo.permissionTable.desc')"
    ></grid-column>
    <grid-column
      field="name"
      :title="$t('roleInfo.permissionTable.name')"
    ></grid-column>
  </grid>
</template>

<script lang="ts" setup>
  import type { Permission } from '@/api/permission';
  import { Grid, GridColumn } from '@opentiny/vue';
  import { toRefs, watch } from 'vue';

  const props = defineProps<{
    permission: Permission[];
  }>();

  const { permission } = toRefs(props);
</script>
