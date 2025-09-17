import { ref, computed, onMounted, onUnmounted } from 'vue'

export function useResponsive(breakpoints = { sm: 640, md: 768, lg: 1024 }) {
  const sm = ref(false)
  const md = ref(false)
  const lg = ref(false)

  const update = () => {
    if (typeof window === 'undefined') return
    sm.value = window.innerWidth <= breakpoints.sm
    md.value = window.innerWidth <= breakpoints.md
    lg.value = window.innerWidth <= breakpoints.lg
  }

  onMounted(() => {
    update()
    window.addEventListener('resize', update)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', update)
  })

  return { sm, md, lg }
}

export function useResponsiveSize() {
  const { lg } = useResponsive()

  const gridSize = computed(() => {
    if (lg.value) return 'mini'
    return 'medium'
  })

  const modalSize = computed(() => {
    if (lg.value) return '100%'
    return '768px'
  })

  return { gridSize, modalSize }
}