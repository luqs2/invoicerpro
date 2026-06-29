import { ref } from 'vue'

interface ToastAction {
  label: string
  handler: () => void
}

interface Toast {
  id: number
  message: string
  type: 'success' | 'danger' | 'warning' | 'info'
  actions?: ToastAction[]
}

const toasts = ref<Toast[]>([])
let nextId = 0

export function useToast() {
  function showToast(message: string, type: Toast['type'] = 'success', duration = 3000, actions?: ToastAction[]) {
    const id = nextId++
    toasts.value.push({ id, message, type, actions })

    if (duration > 0 && (!actions || actions.length === 0)) {
      setTimeout(() => removeToast(id), duration)
    }
  }

  function removeToast(id: number) {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  return { toasts, showToast, removeToast }
}
