<template>
  <grid :data="permission" :size="gridSize" align="center">
    <grid-column type="index" width="10%"></grid-column>
    <grid-column
      field="name"
      :title="$t('roleInfo.permissionTable.name')"
    ></grid-column>
    <grid-column
      field="desc"
      :title="$t('roleInfo.permissionTable.desc')"
    ></grid-column>

  </grid>
</template>

<script lang="ts" setup>
  import type { Permission } from '@/api/permission';
  import { Grid, GridColumn } from '@opentiny/vue';
  import { toRefs, watch } from 'vue';
  import { useResponsiveGrid } from '@/hooks/responsive'

  const { gridSize } = useResponsiveGrid()

  const props = defineProps<{
    permission: Permission[];
  }>();

  const { permission } = toRefs(props);
</script>
