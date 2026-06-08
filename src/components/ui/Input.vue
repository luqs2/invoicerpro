<template>
  <input
    v-bind="$attrs"
    :type="type"
    :value="modelValue"
    :placeholder="placeholder"
    :disabled="disabled"
    :class="['ui-input', { 'ui-input-error': error }]"
    @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
  />
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
  height: 38px;
  padding: 0 12px;
  border: 1.5px solid #e2e8f0;
  border-radius: 9px;
  font-size: 14px;
  color: #0f172a;
  background: #f8fafc;
  outline: none;
  font-family: inherit;
  transition: border-color .15s, box-shadow .15s, background .15s;
}

.ui-input:hover:not(:disabled) { border-color: #c7d2fe; }

.ui-input:focus {
  border-color: #6366f1;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(99,102,241,.1);
}

.ui-input::placeholder { color: #94a3b8; }

.ui-input:disabled { opacity: .55; cursor: not-allowed; }

.ui-input-error { border-color: #ef4444; }
.ui-input-error:focus { box-shadow: 0 0 0 3px rgba(239,68,68,.1); }
</style>
