<template>
  <router-view v-slot="{ Component }">
    <transition
      name="page"
      mode="out-in"
    >
      <component :is="Component" />
    </transition>
  </router-view>
  <OnboardingModal />
  <ConfirmDialog
    v-model="isOpen"
    :title="options.title"
    :message="options.message"
    :confirm-text="options.confirmText"
    :cancel-text="options.cancelText"
    :variant="options.variant"
    @confirm="handleConfirm"
    @cancel="handleCancel"
  />
  <Toast
    :toasts="toasts"
    @remove="removeToast"
  />
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import OnboardingModal from '@/components/OnboardingModal.vue'
import Toast from '@/components/ui/Toast.vue'
import { useConfirm } from '@/composables/useConfirm'
import { useToast } from '@/composables/useToast'

const { isOpen, options, handleConfirm, handleCancel } = useConfirm()
const { toasts, removeToast } = useToast()
</script>

<style>
/* Page transitions */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(6px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
