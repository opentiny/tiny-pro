import { ref, computed, onMounted, onBeforeMount, onBeforeUnmount, onUnmounted } from 'vue';
import { useDebounceFn } from '@vueuse/core';
import { useAppStore } from '@/store';
import { addEventListen, removeEventListen } from '@/utils/event';

const WIDTH = 992;

function queryDevice() {
  const rect = document.body.getBoundingClientRect();
  return rect.width - 1 < WIDTH;
}

export default function useResponsive(immediate?: boolean) {
  const appStore = useAppStore();
  function resizeHandler() {
    if (!document.hidden) {
      const isMobile = queryDevice();
      appStore.toggleDevice(isMobile ? 'mobile' : 'desktop');
      appStore.toggleMenu(isMobile);
    }
  }
  const debounceFn = useDebounceFn(resizeHandler, 100);
  onMounted(() => {
    if (immediate) debounceFn();
  });
  onBeforeMount(() => {
    addEventListen(window, 'resize', debounceFn);
  });
  onBeforeUnmount(() => {
    removeEventListen(window, 'resize', debounceFn);
  });
}

// responsive gridSize
const globalMd = ref(window.innerWidth <= 768)
const globalSm = ref(window.innerWidth <= 375)
let isInitialized = false

function initGlobalResize() {
  if (isInitialized) return
  const onResize = () => {
    globalMd.value = window.innerWidth <= 768
    globalSm.value = window.innerWidth <= 375
  }
  window.addEventListener('resize', onResize)
  isInitialized = true
}

export function useResponsiveGrid() {
  initGlobalResize()
  const gridSize = computed(() => (globalMd.value ? 'mini' : 'medium'))
  return {
    md: globalMd,
    sm: globalSm,
    gridSize
  }
}