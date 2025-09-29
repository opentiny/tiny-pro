<template>
  <button class="toolbar-button" :class="{ active: active }" :title="content">
    <svg v-if="icon" class="button-icon">
      <use :xlink:href="`#icon-${icon}`"></use>
    </svg>
    <span class="button-text">{{ content || '按钮' }}</span>
  </button>
</template>

<script>
export default {
  props: {
    icon: {
      type: String,
      default: ''
    },
    content: {
      type: String,
      default: ''
    },
    active: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style scoped>
.toolbar-button {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border: 1px solid var(--te-common-border-color, #d9d9d9);
  border-radius: 4px;
  background: var(--te-common-bg-default, #fff);
  color: var(--te-common-text-color, #333);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.toolbar-button:hover {
  border-color: var(--te-common-color-primary, #1890ff);
  color: var(--te-common-color-primary, #1890ff);
}

.toolbar-button.active {
  border-color: var(--te-common-color-primary, #1890ff);
  background: var(--te-common-bg-primary, #e6f7ff);
  color: var(--te-common-color-primary, #1890ff);
}

.button-icon {
  width: 14px;
  height: 14px;
  fill: currentColor;
}

.button-text {
  white-space: nowrap;
}
</style>
