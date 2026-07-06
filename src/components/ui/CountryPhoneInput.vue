<template>
  <div class="country-phone-input">
    <div class="country-select-wrap">
      <ComboBox
        :model-value="countryCode"
        :options="COUNTRY_OPTIONS"
        search-placeholder="Search country..."
        @update:model-value="onCountryChange"
      >
        <template #trigger>
          <span class="select-text">{{ flagEmoji }} +{{ dialCode }}</span>
        </template>
        <template #option="{ option }">
          <span class="country-item-label">{{ option.label }}</span>
          <span class="country-item-dial">{{ option.description }}</span>
        </template>
      </ComboBox>
    </div>
    <UiInput
      :model-value="localNumber"
      :placeholder="placeholder"
      @update:model-value="onNumberChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import ComboBox from '@/components/ui/ComboBox.vue'
import UiInput from '@/components/ui/Input.vue'
import { COUNTRY_OPTIONS, DEFAULT_COUNTRY_CODE, countryCodeToFlag, parsePhoneWithCountryCode, combinePhone, getCountryByCode } from '@/data/countries'

const props = withDefaults(defineProps<{
  modelValue?: string
  placeholder?: string
}>(), {
  modelValue: '',
  placeholder: '123 456 7890',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const countryCode = ref(DEFAULT_COUNTRY_CODE)
const localNumber = ref('')

const flagEmoji = computed(() => countryCode.value ? countryCodeToFlag(countryCode.value) : '')
const dialCode = computed(() => getCountryByCode(countryCode.value)?.dialCode ?? '')

function syncFromProp(phone: string) {
  const parsed = parsePhoneWithCountryCode(phone)
  countryCode.value = parsed.countryCode
  localNumber.value = parsed.localNumber
  emitValue()
}

syncFromProp(props.modelValue)

watch(() => props.modelValue, (val) => {
  const combined = combinePhone(countryCode.value, localNumber.value)
  if (val !== combined) {
    syncFromProp(val)
  }
})

function onCountryChange(code: string) {
  countryCode.value = code
  emitValue()
}

function onNumberChange(number: string) {
  localNumber.value = number
  emitValue()
}

function emitValue() {
  emit('update:modelValue', combinePhone(countryCode.value, localNumber.value))
}
</script>

<style scoped>
.country-phone-input {
  display: flex;
  gap: 8px;
  width: 100%;
}

.country-select-wrap {
  position: relative;
  flex-shrink: 0;
  width: 120px;
}

.country-select-wrap :deep(.combobox-trigger) {
  width: 100%;
  height: 44px;
  padding: 0 8px;
  border: 1px solid #D6D0C2;
  border-radius: 8px;
  background: #EDE8DE;
  cursor: pointer;
  font-size: 14px;
  color: #1e1b15;
  transition: border-color 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.country-select-wrap :deep(.combobox-trigger:hover) {
  border-color: #08241f;
}

.select-text {
  font-size: 14px;
  white-space: nowrap;
}

.country-select-wrap :deep(.combobox-trigger:focus-within) {
  border-color: #08241f;
  box-shadow: 0 0 0 3px rgba(8, 36, 31, 0.08);
}

.dark .country-select-wrap :deep(.combobox-trigger) {
  background: #1d201f;
  border-color: #404945;
  color: #e1e3e1;
}

.dark .country-select-wrap :deep(.combobox-trigger:hover) {
  border-color: #a0d0c2;
}

.dark .country-select-wrap :deep(.combobox-trigger:focus-within) {
  border-color: #e6c45c;
  box-shadow: 0 0 0 2px rgba(230, 196, 92, 0.2);
}

.country-item-label {
  flex: 1;
}

.country-item-dial {
  font-size: 13px;
  color: #9a8c7e;
  flex-shrink: 0;
}

.dark .country-item-dial {
  color: #7a8280;
}
</style>
