<template>
  <div class="toolbar-helpGuid">
    <toolbar-base
      content="出码"
      :icon="options.icon.default || options.icon"
      :options="options"
      @click-api="generate"
    >
      <template #default>
        <!-- 使用SystemIntegration替代FileSelector -->
        <system-integration
          :visible="state.showDialogbox"
          :page-info="state.currentPageInfo"
          @confirm="confirmIntegration"
          @cancel="cancel"
        ></system-integration>
      </template>
    </toolbar-base>
  </div>
</template>

<script setup>
/* metaService: engine.toolbars.generate-code.Main */
import { reactive, withDefaults, defineProps } from "vue";
import {
  useCanvas,
  useNotify,
  useLayout,
} from "@opentiny/tiny-engine-meta-register";
import { fs } from "@opentiny/tiny-engine-utils";
import ToolbarBase from "./components/ToolbarBase.vue";
import SystemIntegration from "./SystemIntegration.vue";

// Props 定义
const props = withDefaults(defineProps(), {
  options: () => ({}),
});

// Setup 逻辑
const { getCurrentPage } = useCanvas();

const state = reactive({
  dirHandle: null,
  generating: false,
  showDialogbox: false,
  saveFilesInfo: [],
  currentPageInfo: {}, // 添加页面信息用于SystemIntegration
});

const saveCodeToLocal = async (filesInfo) => {
  if (filesInfo.length && state.dirHandle) {
    await fs.writeFiles(state.dirHandle, filesInfo);
  }
};

const generate = async () => {
  const { isEmptyPage } = useLayout();

  if (isEmptyPage()) {
    useNotify({ type: "warning", message: "请先创建页面" });
    return;
  }

  // 设置当前页面信息用于SystemIntegration
  const currentPage = getCurrentPage();
  state.currentPageInfo = {
    name: currentPage?.name || "NewPage",
    id: currentPage?.id,
    ...currentPage,
  };

  // 直接打开SystemIntegration对话框，不预生成文件
  state.showDialogbox = true;
};

// SystemIntegration的确认处理
const confirmIntegration = async (result) => {
  state.showDialogbox = false;

  const { files, apiResult } = result;

  try {
    // 如果需要保存文件到本地，可以在这里实现
    if (files && files.length > 0) {
      await saveCodeToLocal(files);
    }

    useNotify({
      type: "success",
      title: "集成完成",
      message: `菜单ID: ${apiResult.menuId}，已处理 ${
        files?.length || 0
      } 个文件`,
    });
  } catch (error) {
    useNotify({
      type: "error",
      title: "文件保存失败",
      message: error?.message || "保存文件时出现错误",
    });
  }
};

const cancel = () => {
  state.showDialogbox = false;
  state.generating = false;
  state.saveFilesInfo = [];
};
</script>
<style lang="less" scoped>
.toolbar-generate {
  .toolbar-generate-btn {
    display: flex;
    align-items: center;
  }
  :deep(.tiny-button--default) {
    min-width: 58px;
    height: 26px;
    padding: 0 8px;
    border-radius: 4px;
    background-color: var(--te-toolbars-generate-code-button-bg-color);
    border: none;
    &:not(.disabled):hover {
      background-color: var(--te-toolbars-generate-code-button-bg-color);
    }
    .button-title {
      margin-left: 4px;
    }
  }
}
</style>
