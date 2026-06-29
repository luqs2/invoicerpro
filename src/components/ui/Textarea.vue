<template>
  <textarea
    v-bind="$attrs"
    :value="modelValue"
    :placeholder="placeholder"
    :rows="rows"
    :disabled="disabled"
    class="ui-textarea"
    @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
  />
</template>

<script setup lang="ts">
defineOptions({ inheritAttrs: false })
withDefaults(defineProps<{
  modelValue?: string
  placeholder?: string
  rows?: number
  disabled?: boolean
}>(), { rows: 3 })

defineEmits<{ (e: 'update:modelValue', v: string): void }>()
</script>

<style scoped>
.ui-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1.5px solid #e2e8f0;
  border-radius: 9px;
  font-size: 14px;
  color: #0f172a;
  background: #f8fafc;
  outline: none;
  font-family: inherit;
  resize: vertical;
  min-height: 80px;
  transition: border-color .15s, box-shadow .15s, background .15s;
}
.ui-textarea:hover:not(:disabled) { border-color: #c7d2fe; }
.ui-textarea:focus {
  border-color: #6366f1;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(99,102,241,.1);
}
.ui-textarea::placeholder { color: #94a3b8; }

.dark .ui-textarea {
  background: #1e293b;
  border-color: #334155;
  color: #f1f5f9;
}
.dark .ui-textarea::placeholder { color: #64748b; }
.dark .ui-textarea:focus { border-color: #6366f1; background: #0f172a; }
.dark .ui-textarea:hover:not(:disabled) { border-color: #4f46e5; }
</style>
