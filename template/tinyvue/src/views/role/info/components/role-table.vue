<script lang="ts" setup>
  import { nextTick, reactive, ref, watch } from 'vue';
  import { Role } from '@/store/modules/user/types';
  import {
    Grid as TinyGrid,
    GridColumn as TinyGridColumn,
    Modal,
    TinySelect,
    TinyPopconfirm
  } from '@opentiny/vue';
  import { IconDel,IconCueL } from '@opentiny/vue-icon';
  import { deleteRole , updateRole } from '@/api/role';
  import { Permission } from '@/api/permission';
  import { ITreeNodeData } from '@/router/guard/menu';
  import { useI18n } from 'vue-i18n';
  import useLoading from '@/hooks/loading';
  import { Pager } from '@/types/global';
  import permissionTable from './permission-table.vue';
  
  const props = defineProps<{
    tableData: (Role & { menus: ITreeNodeData[] })[];
    fetchOption: {
      api: (args: { page: Pager }) => any;
    };
    permissions: Permission[];
    pagerConfig: {
      component: any;
      attrs: Pager;
    };
    filter: any;
  }>();

  const emits = defineEmits<{
    menuUpdate: [ITreeNodeData[], number, Role];
    roleDelete: [number];
    updateRoleClose: [];
  }>();
  const roleTable = reactive([]);

  const iconDel = IconDel();
  const iconCueL = IconCueL();
  const { t } = useI18n();
  const grid = ref();
  const { loading, setLoading } = useLoading();

  const onMenuUpdate = (data: ITreeNodeData[], roldId: number, role: Role) => {
    emits('menuUpdate', data, roldId, role);
  };
  const onRoleDelete = (id: number, row) => {
    setLoading(true);
    deleteRole(id)
      .then(() => {
        grid.value.remove(row);
      })
      .then(() => {
        Modal.message({
          message: t('message.delete.success'),
          status: 'success',
        });
        emits('roleDelete', id);
      })
      .catch((error) => {
        if (error.response && error.response.data) {
          const errorMessage = error.response.data.message || '未知错误';
          Modal.message({
            message: errorMessage,
            status: 'error',
          });
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };
  const getPermission = (row:any) => {
    let permissionDate = ''
    if (row?.permission.length) {
      row?.permission.forEach((item, index) => {
        permissionDate = `${permissionDate} ${row?.permission[index].name}`
      });
    }
    return permissionDate
  };
  const onUpdate = (args:any) => {
    updateRole(args.row)
      .then(({ data }) => {
        Modal.message({
          message: t('permissionInfo.edit.success'),
          status: 'success',
        });
        emits('updateRoleClose');
      })
      .catch((error) => {
        if (error.response && error.response.data) {
          const errorMessage = error.response.data.message || '未知错误';
          Modal.message({
            message: errorMessage,
            status: 'error',
          });
        }
      })
      .finally(() => {
        emits('updateRoleClose');
      });
  };
  defineExpose({
    reload: () => {
      grid.value.handleFetch();
    },
  });
</script>

<template>
  <tiny-grid
    ref="grid"
    :fetch-data="props.fetchOption"
    auto-resize
    :loading="loading"
    :pager="props.pagerConfig"
     :edit-config="{ trigger: 'click', mode: 'cell', showStatus: true }"
    remote-filter
    @edit-closed="onUpdate"
  >
    <tiny-grid-column type="expand" width="60">
      <template #default="data">
        <permission-table :permission="data.row.permission" />
      </template>
    </tiny-grid-column>
    <tiny-grid-column
      field="id"
      width="100"
      :title="$t('roleInfo.table.id')"
    ></tiny-grid-column>
    <tiny-grid-column
      field="name"
      :title="$t('roleInfo.table.name')"
      :filter="props.filter.inputFilter"
      :editor="{ component: 'input', autoselect: true }"
    ></tiny-grid-column>
    <tiny-grid-column
    field="permissionIds" 
    :title="$t('roleInfo.table.desc')"
    show-overflow="tooltip"
    :editor="{
      component: TinySelect,
      attrs: {
        multiple: true,
        'collapse-tags': true,
        'value-key':'id',
        options: props.permissions,
        textField: 'name',
        valueField: 'id'
      }
    }">
      <template #default="data">
          {{ getPermission(data.row) }}
      </template>
    </tiny-grid-column>
    <tiny-grid-column :title="$t('roleInfo.table.operations')">
      <template #default="data">
        <iconCueL class="del-icon"></iconCueL>
        <a
          v-permission="'role::update'"
          class="operation-update"
          @click="onMenuUpdate(data.row.menus, data.row.id, data.row)"
        >
          {{ $t('roleInfo.table.bind') }}
        </a>
        <tiny-popconfirm :title="$t('menuInfo.modal.title.confirm')" type="warning" trigger="click" @confirm="onRoleDelete(data.row.id, data.row)">
          <template #reference>
            <iconDel class="del-icon"></iconDel>

            <a
            v-permission="'role::remove'"
            class="operation-update"
          >
            {{ $t('roleInfo.table.operations.delete') }}
          </a>
          </template>
        </tiny-popconfirm>

      </template>
    </tiny-grid-column>
  </tiny-grid>
</template>

<style lang="less" scoped>
  .operation {
    &-delete {
      padding-right: 5px;
      color: red;
    }

    &-update {
      padding-right: 5px;
      color: #1890ff;
    }

    &-pwd-update {
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
