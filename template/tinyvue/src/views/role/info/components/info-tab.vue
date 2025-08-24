<script lang="ts" setup>
  import { useI18n } from 'vue-i18n';
  import { computed, inject, ref } from 'vue';
  import {
    Button as TinyButton,
    Loading as TinyLoading,
    Modal,
    Pager as TinyPager,
    TinyModal,
  } from '@opentiny/vue';
  import { Role } from '@/store/modules/user/types';
  import { createRole, getAllRoleDetail, updateRole } from '@/api/role';
  import { useDisclosure } from '@/hooks/useDisclosure';
  import useLoading from '@/hooks/loading';
  import { getAllMenu, getRoleMenu } from '@/api/menu';
  import { ITreeNodeData, toRoutes } from '@/router/guard/menu';
  import { useI18nMenu } from '@/hooks/useI18nMenu';
  import { useMenuId } from '@/hooks/useMenuId';
  import { useRouter } from 'vue-router';
  import constant from '@/router/constant';
  import { useMenuStore } from '@/store/modules/router';
  import { getAllPermission, Permission } from '@/api/permission';
  import { useTabStore } from '@/store';
  import { FilterType, InputFilterValue, Pager } from '@/types/global';
  import roleTable from './role-table.vue';
  import menuDrawer from './menu-drawer.vue';
  import addRole, { RoleAddData } from './add-role.vue';

  const { t } = useI18n();
  const tableData = ref<any[]>([]);
  const menuDatas = ref<ITreeNodeData[]>([]);
  const menus = ref<ITreeNodeData[]>([]);
  const { open, onOpen, onClose } = useDisclosure();
  const {
    open: addModalVisible,
    onOpen: onAdd,
    onClose: onAddHide,
  } = useDisclosure();
  const { loading, setLoading } = useLoading();
  const i18MenuDatas = computed(() => useI18nMenu(menus.value, t));
  const selectedId = ref<number[]>([]);
  const router = useRouter();
  const menuStore = useMenuStore();
  const tabStore = useTabStore();
  const roleId = ref(-1);
  const permissions = ref<Permission[]>([]);
  const vLoading = TinyLoading.directive;

  const { reloadMenu } = inject<{ reloadMenu: () => void }>('RELOAD');

  setLoading(true);
  getAllMenu()
    .then((res) => {
      menus.value = res.data;
    })
    .finally(() => {
      setLoading(false);
    });
  getAllPermission().then(({ data }) => {
    permissions.value = data;
  });
  const pagerConfig = ref<{
    component: any;
    attrs: Pager;
  }>({
    component: TinyPager,
    attrs: {
      currentPage: 1,
      pageSize: 5,
      pageSizes: [10, 20, 50, 100],
      total: 0,
      layout: 'sizes, total, prev, pager, next, jumper',
    },
  });
  const roleTableRef = ref();
  const allFilter = {
    inputFilter: {
      inputFilter: true,
    },
  };
  const fetchOption = {
    filter: true,
    api: ({ page, filters }: { page: Pager; filters: FilterType }) => {
      let str = '';
      if (filters.name) {
        const condition = (filters.name.value as InputFilterValue).relation;
        if (condition === 'contains') {
          str += '%';
        }
        str += (filters.name.value as InputFilterValue).text;
        if (condition === 'startwith' || condition === 'contains') {
          str += '%';
        }
      }
      return new Promise((resolve) => {
        getAllRoleDetail(page.currentPage, page.pageSize, str).then(
          ({ data }) => {
            tableData.value = data.roleInfo.items;
            data.roleInfo.items.forEach((item,index) => {
                tableData.value[index].permissionIds = [];
                item.permission.forEach((item1) => {
                  tableData.value[index].permissionIds.push(item1.id) 
                });
            });
            resolve({
              result: data.roleInfo.items,
              page: {
                total: data.roleInfo.meta.totalItems,
              },
            });
          },
        );
      });
    },
  };
  const onMenuDrawerClose = () => {
    onClose();
  };
  const onMenuUpdate = (menuTree: ITreeNodeData[], id: number, row) => {
    roleId.value = id;
    selectedId.value = useMenuId(row.menus);
    onOpen();
  };
  const flushRouter = async () => {
    router.clearRoutes();
    constant.forEach((staticRoute) => router.addRoute(staticRoute));
    await menuStore.getMenuList();
    const routes = toRoutes(menuStore.menuList);
    routes.forEach((route) => {
      router.addRoute('root', route);
    });
  };
  const flushTabs = () => {
    const routePaths = router.getRoutes().map((routeItem) => routeItem.path);
    const removeTabs = tabStore.data.filter(
      ({ link }) => !routePaths.includes(link),
    );
    removeTabs.forEach(({ link }) => tabStore.delByLink(link));
  };
  const onConfirm = (ids: number[]) => {
    updateRole({
      id: roleId.value,
      menuIds: ids,
    })
      .then(({ data }) => {
        selectedId.value = ids;
        const itemIdx = tableData.value.findIndex(
          (item) => item.id === roleId.value,
        );
        tableData.value.splice(itemIdx, 1, {
          ...tableData.value[itemIdx],
          menus: data.menus,
        });
        return flushRouter();
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
      .then(() => {
        roleTableRef.value.reload();
        flushTabs();
        reloadMenu();
      })
      .finally(() => {
        open.value = false;
      });
  };
  const onAddRole = (role: RoleAddData) => {
    createRole(role)
      .then(({ data }) => {
        Modal.message({
          message: t('roleInfo.modal.add.success'),
          status: 'success',
        });
        tableData.value.push({
          id: data.id,
          permission: data.permission,
          menus: [],
          name: data.name,
        });
        roleTableRef.value.reload();
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
        onAddHide();
      });
  };
  const onRoleUpdateSuccess = () => {
    roleTableRef.value.reload();
  };
  const onRoleDelete = (id: number) => {
    roleTableRef.value.reload();
  };
</script>

<template>
  <div>
    <div class="tiny-fullscreen-scroll">
      <div class="tiny-full-screen-wrapper">
        <div class="role-add-btn">
          <tiny-button v-permission="'role::add'" type="primary" round @click="onAdd">
            {{ $t('roleInfo.modal.title.add') }}
          </tiny-button>
        </div>
        <div class="table">
          <role-table
            ref="roleTableRef"
            :table-data="tableData"
            :fetch-option="fetchOption"
            :pager-config="pagerConfig"
            :permissions="permissions"
            :filter="allFilter"
            @menu-update="onMenuUpdate"
            @update-role-close="onRoleUpdateSuccess"
            @role-delete="onRoleDelete"
          />
        </div>
      </div>
    </div>
    <menu-drawer
      v-if="open"
      v-loading="loading"
      :visible="open"
      :menus="i18MenuDatas"
      :selected-id="selectedId"
      @close="onMenuDrawerClose"
      @confirm="onConfirm"
    />
    <add-role
      :visible="addModalVisible"
      :permissions="permissions"
      @hide="onAddHide"
      @confirm="onAddRole"
      @cancel="onAddHide"
    />
  </div>
</template>

<style scoped lang="less">
  #contain {
    height: 100%;
    padding: 16px;
    overflow: hidden;
  }

  .role-add-btn {
    padding: 0 0 24px 0;
  }

  .table {
    padding-bottom: 20px;
    background-color: #fff;
  }
</style>
