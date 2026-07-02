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
  background: #F7F4EC;
  border: 1px solid #D6D0C2;
  box-shadow: 0 20px 40px -15px rgba(0,0,0,0.1);
  font-size: 14px;
  font-weight: 500;
  color: #1e1b15;
  pointer-events: auto;
  transform-origin: bottom right;
}

.toast-icon {
  flex-shrink: 0;
}

.toast-success .toast-icon { color: #16a34a; }
.toast-danger .toast-icon  { color: #dc2626; }
.toast-warning .toast-icon { color: #d97706; }
.toast-info .toast-icon    { color: #0284c7; }

.toast-success { border-color: #86efac; }
.toast-danger  { border-color: #fca5a5; }
.toast-warning { border-color: #fcd34d; }
.toast-info    { border-color: #7dd3fc; }

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
  color: #414846;
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
  border: 1px solid #D6D0C2;
  border-radius: 8px;
  background: #F7F4EC;
  font-size: 12px;
  font-weight: 600;
  color: #08241f;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s ease;
  white-space: nowrap;
}
.toast-action-btn:hover { background: #cbe9e0; border-color: #08241f; }

.toast-close:hover { color: #414846; background: #EDE8DE; }

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
  background: #1d201f;
  border-color: #404945;
  color: #e1e3e1;
}
.dark .toast-close { color: #414846; }
.dark .toast-close:hover { color: #c0c8c4; background: #404945; }
.dark .toast-action-btn { background: #404945; border-color: #505050; color: #a0d0c2; }
.dark .toast-action-btn:hover { background: #a0d0c2; border-color: #a0d0c2; color: #111413; }
</style>
