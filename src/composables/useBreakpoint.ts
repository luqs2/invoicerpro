import { ref, onMounted, onUnmounted } from 'vue'

export function useBreakpoint(breakpoint = 768) {
  const isMobile = ref(false)

  function check() {
    isMobile.value = window.innerWidth <= breakpoint
  }

  onMounted(() => {
    check()
    window.addEventListener('resize', check, { passive: true })
  })

  onUnmounted(() => {
    window.removeEventListener('resize', check)
  })

  return { isMobile }
}
