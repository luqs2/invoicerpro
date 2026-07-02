<template>
  <Select v-model="model">
    <SelectTrigger :class="triggerClass" style="color: #1e1b15; background: #EDE8DE; border-color: #D6D0C2;">
      <span>{{ selectedLabel || placeholder }}</span>
    </SelectTrigger>
    <SelectContent style="background: #F7F4EC; border-color: #D6D0C2; color: #1e1b15;">
      <SelectItem
        v-for="opt in options"
        :key="opt.value"
        :value="opt.value"
      >
        {{ opt.label }}
      </SelectItem>
    </SelectContent>
  </Select>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Select, SelectTrigger, SelectContent, SelectItem } from '@/components/ui/select'

interface Option {
  value: string
  label: string
}

const props = withDefaults(defineProps<{
  modelValue?: string
  options: Option[]
  placeholder?: string
  disabled?: boolean
  triggerClass?: string
}>(), {
  modelValue: '',
  placeholder: 'Select…',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const model = computed({
  get: () => props.modelValue,
  set: (v: string) => emit('update:modelValue', v),
})

const selectedLabel = computed(() =>
  props.options.find(o => o.value === props.modelValue)?.label ?? ''
)
</script>

<style scoped>
:deep(.select-trigger) {
  background: #EDE8DE !important;
  border-color: #D6D0C2 !important;
  color: #1e1b15 !important;
}
.dark :deep(.select-trigger) {
  background: #1d201f !important;
  border-color: #404945 !important;
  color: #e1e3e1 !important;
}

:deep(.select-content) {
  background: #F7F4EC !important;
  border-color: #D6D0C2 !important;
  color: #1e1b15 !important;
}
.dark :deep(.select-content) {
  background: #1d201f !important;
  border-color: #404945 !important;
  color: #e1e3e1 !important;
}
</style>
