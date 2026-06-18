<template>
  <Teleport to="body">
    <div class="toast-container">
      <TransitionGroup name="toast">
        <div
          v-for="t in toasts"
          :key="t.id"
          class="toast"
          :class="`toast-${t.type}`"
        >
          <component :is="iconMap[t.type]" :size="16" class="toast-icon" />
          <span class="toast-message">{{ t.message }}</span>
          <button class="toast-close" @click="remove(t.id)" aria-label="Dismiss">
            <X :size="14" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from '@lucide/vue'

interface Toast {
  id: number
  message: string
  type: 'success' | 'danger' | 'warning' | 'info'
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
  padding: 12px 16px;
  border-radius: 12px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  box-shadow: 0 8px 24px rgba(0,0,0,.12), 0 2px 8px rgba(0,0,0,.06);
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
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: none;
  cursor: pointer;
  color: #94a3b8;
  border-radius: 6px;
  transition: color .12s, background .12s;
}
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
</style>
