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
  border: 1px solid #D6D0C2;
  border-radius: 8px;
  font-size: 14px;
  color: #1e1b15;
  background: #EDE8DE;
  outline: none;
  font-family: inherit;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.ui-input:hover:not(:disabled) { border-color: #08241f; }

.ui-input:focus {
  border-color: #08241f;
  box-shadow: 0 0 0 3px rgba(8,36,31,.08);
}

.ui-input::placeholder { color: #414846; }

.ui-input:disabled { opacity: .55; cursor: not-allowed; }

.ui-input-error { border-color: #dc2626; }
.ui-input-error:focus { box-shadow: 0 0 0 3px rgba(220,38,38,.1); }

.dark .ui-input {
  background: #1d201f;
  border-color: #404945;
  color: #e1e3e1;
}
.dark .ui-input::placeholder { color: #c0c8c4; }
.dark .ui-input:focus { border-color: #e6c45c; background: #111413; box-shadow: 0 0 0 2px rgba(230,196,92,.2); }
.dark .ui-input:hover:not(:disabled) { border-color: #a0d0c2; }
</style>
