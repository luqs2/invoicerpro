<template>
  <teleport to="body">
    <transition name="confirm-fade">
      <div
        v-if="modelValue"
        class="confirm-overlay"
        @click.self="cancel"
      >
        <div
          ref="dialogRef"
          class="confirm-dialog"
          role="alertdialog"
          aria-modal="true"
        >
          <div
            class="confirm-icon"
            :class="`confirm-icon-${variant}`"
          >
            <AlertTriangle
              v-if="variant === 'danger'"
              :size="22"
            />
            <Info
              v-else-if="variant === 'warning'"
              :size="22"
            />
            <CheckCircle
              v-else
              :size="22"
            />
          </div>
          <div class="confirm-body">
            <h3 class="confirm-title">
              {{ title }}
            </h3>
            <p class="confirm-message">
              {{ message }}
            </p>
          </div>
          <div class="confirm-actions">
            <button
              class="confirm-btn confirm-btn-cancel"
              @click="cancel"
            >
              {{ cancelText }}
            </button>
            <button
              ref="confirmBtn"
              class="confirm-btn"
              :class="`confirm-btn-${variant}`"
              @click="confirm"
            >
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { AlertTriangle, Info, CheckCircle } from '@lucide/vue'
import { useEscapeKey, useFocusTrap } from '@/composables/useFocusTrap'

const props = withDefaults(defineProps<{
  modelValue: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
}>(), {
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  variant: 'danger',
})

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()

const confirmBtn = ref<HTMLButtonElement>()
const dialogRef = ref<HTMLElement | null>(null)

useEscapeKey(() => {
  if (props.modelValue) cancel()
})

useFocusTrap(dialogRef)

watch(() => props.modelValue, async (open) => {
  if (open) {
    await nextTick()
    confirmBtn.value?.focus()
  }
})

function confirm() {
  emit('confirm')
  emit('update:modelValue', false)
}

function cancel() {
  emit('cancel')
  emit('update:modelValue', false)
}
</script>

<style scoped>
.confirm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 24px;
}

.confirm-dialog {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 400px;
  padding: 28px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  text-align: center;
}

.confirm-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.confirm-icon-danger { background: #fee2e2; color: #ef4444; }
.confirm-icon-warning { background: #fef3c7; color: #f59e0b; }
.confirm-icon-info { background: #dbeafe; color: #3b82f6; }

.confirm-body { display: flex; flex-direction: column; gap: 6px; }

.confirm-title {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.confirm-message {
  font-size: 14px;
  color: #64748b;
  margin: 0;
  line-height: 1.5;
}

.confirm-actions {
  display: flex;
  gap: 10px;
  width: 100%;
  margin-top: 4px;
}

.confirm-btn {
  flex: 1;
  height: 40px;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: opacity 0.15s, transform 0.1s;
}
.confirm-btn:active { transform: scale(0.98); }

.confirm-btn-cancel {
  background: #f1f5f9;
  color: #374151;
}
.confirm-btn-cancel:hover { background: #e2e8f0; }

.confirm-btn-danger {
  background: #ef4444;
  color: #ffffff;
}
.confirm-btn-danger:hover { background: #dc2626; }

.confirm-btn-warning {
  background: #f59e0b;
  color: #ffffff;
}
.confirm-btn-warning:hover { background: #d97706; }

.confirm-btn-info {
  background: #6366f1;
  color: #ffffff;
}
.confirm-btn-info:hover { background: #4f46e5; }

/* Transition */
.confirm-fade-enter-active,
.confirm-fade-leave-active { transition: opacity 0.2s; }
.confirm-fade-enter-active .confirm-dialog,
.confirm-fade-leave-active .confirm-dialog { transition: transform 0.2s, opacity 0.2s; }
.confirm-fade-enter-from,
.confirm-fade-leave-to { opacity: 0; }
.confirm-fade-enter-from .confirm-dialog { transform: scale(0.95); opacity: 0; }
.confirm-fade-leave-to .confirm-dialog { transform: scale(0.95); opacity: 0; }

.dark .confirm-dialog { background: #1e293b; }
.dark .confirm-title { color: #f1f5f9; }
.dark .confirm-message { color: #94a3b8; }
.dark .confirm-btn-cancel { background: #334155; color: #e2e8f0; }
.dark .confirm-btn-cancel:hover { background: #475569; }
.dark .confirm-icon-danger { background: #450a0a; color: #f87171; }
.dark .confirm-icon-warning { background: #451a03; color: #fbbf24; }
.dark .confirm-icon-info { background: #1e3a5f; color: #60a5fa; }
</style>
