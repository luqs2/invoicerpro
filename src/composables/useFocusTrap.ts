import { onMounted, onUnmounted, type Ref } from 'vue'

export function useEscapeKey(onEscape: () => void) {
  function handler(e: KeyboardEvent) {
    if (e.key === 'Escape') onEscape()
  }

  onMounted(() => window.addEventListener('keydown', handler))
  onUnmounted(() => window.removeEventListener('keydown', handler))
}

export function useFocusTrap(elementRef: Ref<HTMLElement | null>) {
  function getFocusableElements(): HTMLElement[] {
    if (!elementRef.value) return []
    return Array.from(
      elementRef.value.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    )
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key !== 'Tab' || !elementRef.value) return

    const focusable = getFocusableElements()
    if (focusable.length === 0) return

    const first = focusable[0]
    const last = focusable[focusable.length - 1]

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault()
        last.focus()
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
  }

  onMounted(() => {
    elementRef.value?.addEventListener('keydown', handleKeydown)
    const focusable = getFocusableElements()
    if (focusable.length > 0) {
      focusable[0].focus()
    }
  })

  onUnmounted(() => {
    elementRef.value?.removeEventListener('keydown', handleKeydown)
  })
}
