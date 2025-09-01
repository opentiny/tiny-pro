import { ref, computed, onMounted, onUnmounted } from 'vue'

export function useResponsive(breakpoints = { md: 768, sm: 375 }) {
  const md = ref(false)
  const sm = ref(false)

  const update = () => {
    if (typeof window === 'undefined') return
    md.value = window.innerWidth <= breakpoints.md
    sm.value = window.innerWidth <= breakpoints.sm
  }

  onMounted(() => {
    update()
    window.addEventListener('resize', update)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', update)
  })

  return { sm, md }
}

export function useResponsiveSize() {
  const { md } = useResponsive()

  const gridSize = computed(() => {
    if (md.value) return 'mini'
    return 'medium'
  })

  const modalSize = computed(() => {
    if (md.value) return '100%'
    return '768px'
  })

  return { gridSize, modalSize }
}