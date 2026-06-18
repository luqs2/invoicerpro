import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

interface ShortcutMap {
  [key: string]: () => void
}

export function useKeyboardShortcuts() {
  const router = useRouter()

  const shortcuts: ShortcutMap = {
    'n': () => router.push('/app/invoices/new'),
    'r': () => router.push('/app/receipts/new'),
    'd': () => router.push('/app/dashboard'),
    'i': () => router.push('/app/invoices'),
    'c': () => router.push('/app/clients'),
    't': () => router.push('/app/templates'),
    's': () => router.push('/app/settings'),
  }

  function handleKeydown(e: KeyboardEvent) {
    if (
      e.target instanceof HTMLInputElement ||
      e.target instanceof HTMLTextAreaElement ||
      e.target instanceof HTMLSelectElement ||
      e.metaKey || e.ctrlKey || e.altKey
    ) {
      return
    }

    const handler = shortcuts[e.key]
    if (handler) {
      e.preventDefault()
      handler()
    }
  }

  onMounted(() => window.addEventListener('keydown', handleKeydown))
  onUnmounted(() => window.removeEventListener('keydown', handleKeydown))
}
