<template>
  <Teleport to="body">
    <div
      class="toast-container"
      aria-live="polite"
      aria-atomic="false"
    >
      <TransitionGroup name="toast">
        <div
          v-for="t in toasts"
          :key="t.id"
          class="toast"
          :class="`toast-${t.type}`"
          role="status"
        >
          <component
            :is="iconMap[t.type]"
            :size="16"
            class="toast-icon"
          />
          <span class="toast-message">{{ t.message }}</span>
          <div
            v-if="t.actions?.length"
            class="toast-actions"
          >
            <button
              v-for="(action, i) in t.actions"
              :key="i"
              class="toast-action-btn"
              @click="action.handler(); remove(t.id)"
            >
              {{ action.label }}
            </button>
          </div>
          <button
            class="toast-close"
            aria-label="Dismiss"
            @click="remove(t.id)"
          >
            <X :size="14" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from '@lucide/vue'

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

defineProps<{ toasts: Toast[] }>()
const emit = defineEmits<{ (e: 'remove', id: number): void }>()

const iconMap = {
  success: CheckCircle,
  danger: AlertCircle,
  warning: AlertTriangle,
  info: Info,
}

function remove(id: number) {
  emit('remove', id)
}
</script>

<style scoped>
.toast-container {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 9999;
  display: flex;
  flex-direction: column-reverse;
  gap: 8px;
  pointer-events: none;
  max-width: 380px;
  width: 100%;
}

.toast {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 18px;
  border-radius: 14px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  box-shadow: 0 20px 40px -15px rgba(0,0,0,0.1);
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  pointer-events: auto;
  transform-origin: bottom right;
}

.toast-icon {
  flex-shrink: 0;
}

.toast-success .toast-icon { color: #16a34a; }
.toast-danger .toast-icon  { color: #ef4444; }
.toast-warning .toast-icon { color: #f59e0b; }
.toast-info .toast-icon    { color: #3b82f6; }

.toast-success { border-color: #bbf7d0; }
.toast-danger  { border-color: #fecaca; }
.toast-warning { border-color: #fde68a; }
.toast-info    { border-color: #bfdbfe; }

.toast-message {
  flex: 1;
  min-width: 0;
  line-height: 1.4;
}

.toast-close {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: none;
  cursor: pointer;
  color: #94a3b8;
  border-radius: 8px;
  transition: all 0.2s ease;
}
.toast-actions {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.toast-action-btn {
  padding: 6px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
  font-size: 12px;
  font-weight: 600;
  color: #4f46e5;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s ease;
  white-space: nowrap;
}
.toast-action-btn:hover { background: #f5f3ff; border-color: #c7d2fe; }

.toast-close:hover { color: #64748b; background: #f1f5f9; }

/* Transitions */
.toast-enter-active {
  transition: all .3s cubic-bezier(.21,1.02,.73,1);
}
.toast-leave-active {
  transition: all .2s cubic-bezier(.06,.71,.55,1);
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(40px) scale(.95);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(40px) scale(.95);
}
.toast-move {
  transition: transform .3s ease;
}

/* Mobile: top center */
@media (max-width: 768px) {
  .toast-container {
    top: 16px;
    bottom: auto;
    left: 16px;
    right: 16px;
    max-width: none;
    flex-direction: column;
  }

  .toast {
    transform-origin: top center;
  }

  .toast-enter-from {
    opacity: 0;
    transform: translateY(-20px) scale(.95);
  }
  .toast-leave-to {
    opacity: 0;
    transform: translateY(-20px) scale(.95);
  }
}

/* Dark mode */
.dark .toast {
  background: #1e293b;
  border-color: #334155;
  color: #e2e8f0;
}
.dark .toast-close { color: #64748b; }
.dark .toast-close:hover { color: #94a3b8; background: #334155; }
.dark .toast-action-btn { background: #334155; border-color: #475569; color: #818cf8; }
.dark .toast-action-btn:hover { background: #312e81; border-color: #4f46e5; }
</style>
