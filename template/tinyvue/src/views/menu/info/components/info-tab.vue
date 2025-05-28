<script lang="ts" setup>
  import { createMenu, deleteMenu, getAllMenu, updateMenu } from '@/api/menu';
  import { useI18nMenu } from '@/hooks/useI18nMenu';
  import { flushRouter, ITreeNodeData } from '@/router/guard/menu';
  import {
    Button as TinyButton,
    Modal as TinyModal,
    Loading,
  } from '@opentiny/vue';
  import { getAllLocalItems } from '@/api/local';
  import useLoading from '@/hooks/loading';
  import {
    ComponentInstance,
    computed,
    inject,
    onMounted,
    ref,
    watch,
  } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useDeepClone } from '@/hooks/useDeepClone';
  import { useMenuStore } from '@/store/modules/router';
  import { useRouter } from 'vue-router';
  import { useTabStore } from '@/store';
  import menuTree, { Node } from './menu-tree.vue';
  import UpdateForm from './update-form.vue';
  import AddMenu from './add-menu.vue';

  const { t } = useI18n();
  const vLoading = Loading.directive;
  const rawMenuData = ref<ITreeNodeData[]>([]);
  const localeData = ref<{ value: string; label: string }[]>([]);
  const i18nMenuData = computed(() => useI18nMenu(rawMenuData.value, t));

  const readonly = ref(false);
  const updateModal = ref(false);
  const DEFAULT_NODE = {
    id: '',
    label: '',
    url: '',
    component: '',
    customIcon: '',
    menuType: '',
    parentId: 0,
    order: 0,
    locale: '',
  };
  const activeNode = ref<ITreeNodeData>();
  const form = ref<ComponentInstance<typeof UpdateForm>>();
  const addMenu = ref<ComponentInstance<typeof AddMenu>>();
  const { loading, setLoading } = useLoading(false);
  const { loading: treeLoading, setLoading: setTreeLoading } = useLoading(true);
  const { loading: addLoading, setLoading: setAddLoading } = useLoading();
  const addModal = ref(false);
  const router = useRouter();
  const tabStore = useTabStore();

  const handleAddMenu = () => {
    addModal.value = true;
  };
  const onAddMenuClose = () => {
    addModal.value = false;
  };
  const onClickAdd = () => {
    addMenu.value
      .valid()
      .then(() => {
        const menuInfo = addMenu.value.getMenuInfo();
        setAddLoading(true);
        createMenu(menuInfo)
          .then(() => {
            TinyModal.message({
              message: t('menuInfo.modal.add.success'),
              status: 'success',
            });
            addModal.value = false;
            return updateUserMenu();
          })
          .then(() => fetchMenu())
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
            setAddLoading(false);
          });
      })
      .catch(() => {});
  };
  const onClose = () => {
    activeNode.value = DEFAULT_NODE;
  };
  const onUpdate = ( data : Node) => {
    updateModal.value = true;
    activeNode.value = data;
    readonly.value = false;
  };
  const onCheck = (data : Node) => {
    activeNode.value = data;
    updateModal.value = true;
    readonly.value = true;
  };
  const onCancel = () => {
    activeNode.value = DEFAULT_NODE;
    updateModal.value = false;
  };
  const flushTabs = () => {
    const routePaths = router.getRoutes().map((routeItem) => routeItem.path);
    const removeTabs = tabStore.data.filter(
      ({ link }) => !routePaths.includes(link),
    );
    removeTabs.forEach(({ link }) => tabStore.delByLink(link));
    if (!tabStore.data.includes(tabStore.current)) {
      tabStore.$patch({
        current: tabStore.data[0],
      });
    }
  };
  const onDelete = ( data : Node) => {

    setTreeLoading(true);
    const node = useDeepClone(data);
    if (node.parentId === null) {
      node.parentId = -1;
    }
  
    deleteMenu(Number(node.id.toString()), node.parentId)
      .then(() => {
        TinyModal.message({
          message: '删除成功',
          status: 'success',
        });
        return fetchMenu();
      })
      .then(() => {
        return updateUserMenu();
      })
      .then(() => {
        flushTabs();
      })
      .catch((reason) => {
        const error = reason;
        if (error.response && error.response.data) {
          const errorMessage = error.response.data.message || '未知错误';
          TinyModal.message({
            message: errorMessage,
            status: 'error',
          });
        }
      })
      .finally(() => {
        setTreeLoading(false);
      });
  };
  const onConfirm = () => {
    setLoading(true);
    form.value
      .valid()
      .then(() => {
        const menuInfo = form.value.getMenuInfo();
        activeNode.value = {
          ...DEFAULT_NODE,
        };
        if (menuInfo.id === menuInfo.parentId) {
          TinyModal.message({
            message: t('menuInfo.modal.message.error'),
            status: 'error',
          });
          return;
        }
        updateMenu({
          ...menuInfo,
          path: menuInfo.url,
          url: undefined,
          name: menuInfo.oldLabel,
        })
          .then(() => {
            TinyModal.message({
              message: t('menuInfo.modal.edit.success'),
              status: 'success',
            });
            setTimeout(() => {
              router.go(0);
            }, 200);
            setTreeLoading(true);
            return fetchMenu();
          })
          .then(() => updateUserMenu())
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
            setTreeLoading(false);
          });
        updateModal.value = false;
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
      });
  };
  const fetchMenu = async () => {
    const { data } = await getAllMenu();
    rawMenuData.value = data;
  };
  const menuStore = useMenuStore();
  const { reloadMenu } = inject<{ reloadMenu: () => void }>('RELOAD');
  const updateUserMenu = async () => {
    await flushRouter(router);
    reloadMenu();
    return menuStore.getMenuList();
  };
  const fetchLocalItems = () => {
    getAllLocalItems(1, 0, 1).then(({ data }) => {
      localeData.value = data.items.map((item) => {
        return {
          value: item.key,
          label: t(item.key),
        };
      });
    });
  };

  const { locale } = useI18n();
  watch(locale, () => {
    fetchLocalItems();
  });

  onMounted(() => {
    Promise.all([fetchMenu(), fetchLocalItems()]).finally(() => {
      treeLoading.value = false;
    });
  });
</script>

<template>
  <div class="tiny-fullscreen-scroll">
    <div class="tiny-fullscreen-wrapper">
      <div class="menu-add-btn">
        <tiny-button
          v-permission="'menu::add'"
          type="primary"
          @click="handleAddMenu"
          >{{ $t('menuInfo.modal.title.add') }}</tiny-button
        >
      </div>
      <menu-tree
        v-loading="treeLoading"
        :data="i18nMenuData"
        :locale-data="localeData"
        @update="onUpdate"
        @check="onCheck"
        @delete="onDelete"
      />
      <tiny-modal
        v-model="addModal"
        show-footer
        resize
        width="700"  
        height="auto" 
        :title="$t('menuInfo.modal.title.add')"
        @close="onAddMenuClose"
      >
        <add-menu
          v-if="addModal"
          ref="addMenu"
          :menus="i18nMenuData"
          :locales="localeData"
        />
        <template #footer>
          <tiny-button round  @click="onAddMenuClose">{{
            $t('menu.btn.cancel')
          }}</tiny-button>
          <tiny-button
            type="primary"
            round
            :loading="addLoading"
            @click="onClickAdd"
            >{{ $t('menu.btn.confirm') }}</tiny-button
          >
        </template>
      </tiny-modal>
      <tiny-modal
        v-if="!readonly"
        v-model="updateModal"
        show-footer
        :mask-closable="true"
        resize
        :title="$t('menuInfo.modal.title.update')"
        @close="onClose"
      >
        <update-form
          v-if="updateModal"
          ref="form"
          :node="activeNode"
          :menus="i18nMenuData"
          :locale-data="localeData"
          :readonly="readonly"
        />

        <template #footer>
          <tiny-button
            v-if="!readonly"
            type="primary"
            :loading="loading"
            @click="onConfirm"
            >{{ $t('menu.btn.confirm') }}</tiny-button
          >
          <tiny-button v-if="!readonly" @click="onCancel">{{
            $t('menu.btn.cancel')
          }}</tiny-button>
        </template>
      </tiny-modal>
      <tiny-modal
        v-if="readonly"
        v-model="updateModal"
        show-footer
        :mask-closable="true"
        resize
        :title="$t('menuInfo.modal.title.info')"
        @close="onClose"
      >
        <update-form
          v-if="updateModal"
          ref="form"
          :node="activeNode"
          :menus="i18nMenuData"
          :locale-data="localeData"
          :readonly="readonly"
        />
      </tiny-modal>
    </div>
  </div>
</template>

<style scoped lang="less">
  #contain {
    height: 100%;
    padding: 15px;
    overflow: hidden;
  }

  .menu-add-btn {
    padding: 10px 0 10px 10px;
  }

  .table {
    padding-bottom: 20px;
    background-color: #fff;
  }

  .operation {
    &-delete {
      padding-right: 10px;
      color: red;
    }

    &-update {
      padding-right: 5px;
      color: #1890ff;
    }

    &-info {
      padding-right: 10px;
      color: orange;
    }
  }
</style>
