<template>
  <span class="toolbar-icon" :title="content">
    <svg v-if="icon" class="icon" :class="{ active: active }">
      <use :xlink:href="`#icon-${icon}`"></use>
    </svg>
    <span v-else class="icon-text">{{ content || '工具' }}</span>
  </span>
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
.toolbar-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

.icon {
  width: 16px;
  height: 16px;
  fill: currentColor;
}

.icon.active {
  color: var(--te-common-color-primary, #1890ff);
}

.icon-text {
  font-size: 12px;
  color: var(--te-common-text-color, #333);
}
</style>
