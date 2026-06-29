<template>
  <Select v-model="model">
    <SelectTrigger :class="triggerClass" style="color: #0f172a">
      <span>{{ selectedLabel || placeholder }}</span>
    </SelectTrigger>
    <SelectContent class="bg-white border border-gray-200 shadow-lg text-gray-900">
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
