<template>
  <input
    v-bind="$attrs"
    :type="type"
    :value="modelValue"
    :placeholder="placeholder"
    :disabled="disabled"
    :class="['ui-input', { 'ui-input-error': error }]"
    @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
  >
</template>

<script setup lang="ts">
defineOptions({ inheritAttrs: false })
withDefaults(defineProps<{
  modelValue?: string | number
  type?: string
  placeholder?: string
  disabled?: boolean
  error?: boolean
}>(), { type: 'text' })

defineEmits<{ (e: 'update:modelValue', v: string): void }>()
</script>

<style scoped>
.ui-input {
  width: 100%;
  height: 44px;
  padding: 0 14px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  color: #0f172a;
  background: #ffffff;
  outline: none;
  font-family: inherit;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.ui-input:hover:not(:disabled) { border-color: #c7d2fe; }

.ui-input:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99,102,241,.1);
}

.ui-input::placeholder { color: #94a3b8; }

.ui-input:disabled { opacity: .55; cursor: not-allowed; }

.ui-input-error { border-color: #ef4444; }
.ui-input-error:focus { box-shadow: 0 0 0 3px rgba(239,68,68,.1); }

.dark .ui-input {
  background: #1e293b;
  border-color: #334155;
  color: #f1f5f9;
}
.dark .ui-input::placeholder { color: #64748b; }
.dark .ui-input:focus { border-color: #6366f1; background: #0f172a; }
.dark .ui-input:hover:not(:disabled) { border-color: #4f46e5; }
</style>
