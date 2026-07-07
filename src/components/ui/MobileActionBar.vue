<template>
  <div class="mobile-action-bar">
    <div class="mab-left">
      <span class="mab-label">{{ label }}</span>
      <span class="mab-value">{{ formattedTotal }}</span>
    </div>
    <div class="mab-actions">
      <UiButton
        v-if="showExport"
        variant="outline"
        size="sm"
        :disabled="exportDisabled"
        @click="$emit('export')"
      >
        <Download :size="14" />
      </UiButton>
      <UiButton
        v-if="showSend"
        variant="outline"
        size="sm"
        :disabled="sendDisabled"
        @click="$emit('send')"
      >
        <Send :size="14" />
      </UiButton>
      <UiButton
        size="sm"
        :loading="saving"
        @click="$emit('save')"
      >
        Save
      </UiButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Download, Send } from '@lucide/vue'
import UiButton from './Button.vue'

withDefaults(defineProps<{
  formattedTotal: string
  label?: string
  saving?: boolean
  exportDisabled?: boolean
  sendDisabled?: boolean
  showExport?: boolean
  showSend?: boolean
}>(), {
  label: 'Total',
  saving: false,
  exportDisabled: false,
  sendDisabled: false,
  showExport: true,
  showSend: true,
})

defineEmits<{
  export: []
  send: []
  save: []
}>()
</script>

<style scoped>
.mobile-action-bar {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #F7F4EC;
  border-top: 1px solid #D6D0C2;
  padding: 12px 16px;
  align-items: center;
  justify-content: space-between;
  z-index: 60;
  box-shadow: 0 -2px 10px rgba(0,0,0,.08);
}

.mab-left {
  display: flex;
  flex-direction: column;
}

.mab-label {
  font-size: 11px;
  font-weight: 600;
  color: #414846;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.mab-value {
  font-size: 20px;
  font-weight: 800;
  color: #08241f;
  font-variant-numeric: tabular-nums;
}

.mab-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

@media (max-width: 900px) {
  .mobile-action-bar { display: flex; bottom: 60px; }
}

/* Dark mode */
:global(.dark) .mobile-action-bar { background: #1d201f; border-color: rgba(255,255,255,.05); }
:global(.dark) .mab-label { color: #c0c8c4; }
:global(.dark) .mab-value { color: #a0d0c2; }
</style>
