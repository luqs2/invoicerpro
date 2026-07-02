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
  border: 1.5px solid #D6D0C2;
  border-radius: 9px;
  font-size: 14px;
  color: #1e1b15;
  background: #EDE8DE;
  outline: none;
  font-family: inherit;
  resize: vertical;
  min-height: 80px;
  transition: border-color .15s, box-shadow .15s, background .15s;
}
.ui-textarea:hover:not(:disabled) { border-color: #08241f; }
.ui-textarea:focus {
  border-color: #08241f;
  background: #F7F4EC;
  box-shadow: 0 0 0 3px rgba(8,36,31,.1);
}
.ui-textarea::placeholder { color: #414846; }

.dark .ui-textarea {
  background: #1d201f;
  border-color: #404945;
  color: #e1e3e1;
}
.dark .ui-textarea::placeholder { color: #8a938f; }
.dark .ui-textarea:focus { border-color: #e6c45c; background: #111413; box-shadow: 0 0 0 2px rgba(230,196,92,.2); }
.dark .ui-textarea:hover:not(:disabled) { border-color: #a0d0c2; }
</style>
