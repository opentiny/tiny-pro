<template>
  <span class="toolbar-item-wrap" @click="click">
    <component :is="getRender()" v-bind="state">
      <template #default>
        <slot name="button"></slot>
      </template>
    </component>
    <slot></slot>
    <span v-if="state.options?.collapsed && content">{{ state.content }}</span>
  </span>
</template>

<script>
import { reactive, computed } from "vue";
import ToolbarBaseIcon from "./ToolbarBaseIcon.vue";
import ToolbarBaseButton from "./ToolbarBaseButton.vue";

export default {
  components: {
    ToolbarBaseIcon,
    ToolbarBaseButton,
  },
  props: {
    icon: {
      type: String,
      default: "",
    },
    content: {
      type: String,
      default: "",
    },
    options: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: ["click-api"],
  setup(props, { emit }) {
    const state = reactive({
      icon: computed(() => props.icon),
      content: computed(() => props.content),
      options: computed(() => props.options),
    });

    const click = () => {
      emit("click-api");
    };

    const getRender = () => {
      if (props.options.renderType === "button") {
        return "ToolbarBaseButton";
      }
      return "ToolbarBaseIcon";
    };

    return {
      state,
      click,
      getRender,
    };
  },
};
</script>

<style scoped>
.toolbar-item-wrap {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.toolbar-item-wrap:hover {
  background-color: var(--te-common-bg-hover, #f5f5f5);
}
</style>
