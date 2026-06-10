<template>
  <SelectRoot v-model="model" :disabled="disabled">
    <SelectTrigger :class="cn(triggerClass)">
      <SelectValue :placeholder="placeholder" />
      <ChevronsUpDown :size="14" class="select-chevron" />
    </SelectTrigger>
    <SelectPortal>
      <SelectContent :class="cn('select-content')" position="popper" :side-offset="4">
        <SelectViewport class="select-viewport">
          <SelectItem
            v-for="opt in options"
            :key="opt.value"
            :value="opt.value"
            :class="cn('select-item')"
          >
            <SelectItemText>{{ opt.label }}</SelectItemText>
            <SelectItemIndicator class="select-item-indicator">
              <Check :size="13" />
            </SelectItemIndicator>
          </SelectItem>
        </SelectViewport>
      </SelectContent>
    </SelectPortal>
  </SelectRoot>
</template>

<script setup lang="ts">
import {
  SelectRoot, SelectTrigger, SelectValue, SelectPortal,
  SelectContent, SelectViewport, SelectItem, SelectItemText,
  SelectItemIndicator,
} from 'radix-vue'
import { ChevronsUpDown, Check } from '@lucide/vue'
import { cn } from '@/lib/utils'

interface Option {
  value: string
  label: string
}

withDefaults(defineProps<{
  options: Option[]
  placeholder?: string
  disabled?: boolean
  triggerClass?: string
}>(), {
  placeholder: 'Select…',
})

const model = defineModel<string>()
</script>

<style scoped>
:deep(.select-trigger) {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
  height: 38px;
  padding: 0 12px;
  border: 1.5px solid #e2e8f0;
  border-radius: 9px;
  background: #f8fafc;
  font-size: 14px;
  color: #0f172a;
  cursor: pointer;
  font-family: inherit;
  outline: none;
  transition: border-color .15s, box-shadow .15s;
  white-space: nowrap;
}

:deep(.select-trigger:hover) {
  border-color: #c7d2fe;
}

:deep(.select-trigger[data-state="open"]),
:deep(.select-trigger:focus) {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99,102,241,.1);
  background: #ffffff;
}

:deep(.select-trigger[data-disabled]) {
  opacity: 0.5;
  cursor: not-allowed;
}

.select-chevron {
  color: #94a3b8;
  flex-shrink: 0;
}

:deep(.select-content) {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  box-shadow: 0 8px 30px rgba(0,0,0,.12), 0 2px 8px rgba(0,0,0,.06);
  overflow: hidden;
  z-index: 9999;
  min-width: var(--radix-select-trigger-width);
  max-height: var(--radix-select-content-available-height);
  animation: slideDown .12s ease;
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-4px); }
  to   { opacity: 1; transform: translateY(0); }
}

:deep(.select-viewport) {
  padding: 4px;
}

:deep(.select-item) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px 8px 12px;
  border-radius: 6px;
  font-size: 14px;
  color: #374151;
  cursor: pointer;
  outline: none;
  transition: background .1s, color .1s;
  user-select: none;
}

:deep(.select-item[data-highlighted]) {
  background: #f5f3ff;
  color: #4f46e5;
}

:deep(.select-item[data-state="checked"]) {
  color: #4f46e5;
  font-weight: 600;
}

:deep(.select-item-indicator) {
  color: #6366f1;
}
</style>