<template>
  <div
    ref="rootRef"
    class="combobox"
    @click="toggle"
  >
    <div class="combobox-trigger">
      <slot
        name="trigger"
        :selected="selectedOption"
      >
        <span class="combobox-value">{{ selectedLabel }}</span>
      </slot>
      <ChevronDown
        class="combobox-chevron"
        :size="14"
      />
    </div>

    <Teleport to="body">
      <div
        v-if="isOpen"
        class="combobox-dropdown"
        :style="dropdownStyle"
      >
        <input
          ref="searchInputRef"
          v-model="query"
          class="combobox-search"
          :placeholder="searchPlaceholder"
          @click.stop
          @keydown.escape="close"
          @keydown.enter.prevent="selectHighlighted"
          @keydown.arrow-down.prevent="moveHighlight(1)"
          @keydown.arrow-up.prevent="moveHighlight(-1)"
        >
        <div class="combobox-list">
          <div
            v-for="(opt, idx) in filtered"
            :key="opt.value"
            :class="['combobox-item', { 'combobox-item--active': idx === highlightIndex }]"
            @click.stop="select(opt.value)"
            @mouseenter="highlightIndex = idx"
          >
            <slot
              name="option"
              :option="opt"
              :is-active="idx === highlightIndex"
            >
              <span class="combobox-item-label">{{ opt.label }}</span>
              <span
                v-if="opt.description"
                class="combobox-item-desc"
              >{{ opt.description }}</span>
            </slot>
          </div>
          <div
            v-if="filtered.length === 0"
            class="combobox-empty"
          >
            No results found
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts" generic="T = string">
import { ref, computed, nextTick } from 'vue'
import { ChevronDown } from '@lucide/vue'

export interface ComboBoxOption {
  value: T
  label: string
  description?: string
}

const props = withDefaults(defineProps<{
  modelValue: T | null
  options: ComboBoxOption[]
  placeholder?: string
  searchPlaceholder?: string
  maxVisible?: number
}>(), {
  placeholder: 'Select...',
  searchPlaceholder: 'Search...',
  maxVisible: 50,
})

const emit = defineEmits<{
  'update:modelValue': [value: T]
}>()

const rootRef = ref<HTMLElement | null>(null)
const searchInputRef = ref<HTMLInputElement | null>(null)
const isOpen = ref(false)
const query = ref('')
const highlightIndex = ref(0)
const dropdownStyle = ref<Record<string, string>>({})

const selectedOption = computed(() =>
  props.options.find(o => o.value === props.modelValue) ?? null
)

const selectedLabel = computed(() =>
  selectedOption.value?.label ?? props.placeholder
)

const filtered = computed(() => {
  const q = query.value.toLowerCase().trim()
  const list = q
    ? props.options.filter(o =>
        o.label.toLowerCase().includes(q) ||
        (o.description && o.description.toLowerCase().includes(q))
      )
    : props.options
  return list.slice(0, props.maxVisible)
})

function toggle() {
  isOpen.value ? close() : open()
}

function open() {
  query.value = ''
  highlightIndex.value = 0
  isOpen.value = true
  positionDropdown()
  nextTick(() => searchInputRef.value?.focus())
  document.addEventListener('click', onOutsideClick)
}

function close() {
  isOpen.value = false
  document.removeEventListener('click', onOutsideClick)
}

function onOutsideClick(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (!target.closest('.combobox') && !target.closest('.combobox-dropdown')) {
    close()
  }
}

function positionDropdown() {
  nextTick(() => {
    if (!rootRef.value) return
    const rect = rootRef.value.getBoundingClientRect()
    dropdownStyle.value = {
      position: 'fixed',
      top: `${rect.bottom + 4}px`,
      left: `${rect.left}px`,
      width: `${Math.max(rect.width, 200)}px`,
      zIndex: '9999',
    }
  })
}

function select(value: T) {
  emit('update:modelValue', value)
  close()
}

function selectHighlighted() {
  const opt = filtered.value[highlightIndex.value]
  if (opt) select(opt.value)
}

function moveHighlight(delta: number) {
  const len = filtered.value.length
  if (len === 0) return
  highlightIndex.value = (highlightIndex.value + delta + len) % len
}
</script>

<style scoped>
.combobox {
  position: relative;
  width: 100%;
}

.combobox-trigger {
  display: flex;
  align-items: center;
  gap: 4px;
}

.combobox-value {
  flex: 1;
  min-width: 0;
}

.combobox-chevron {
  color: #414846;
  flex-shrink: 0;
}

.dark .combobox-chevron {
  color: #c0c8c4;
}
</style>

<style>
/* Global — rendered via Teleport */
.combobox-dropdown {
  background: #F7F4EC;
  border: 1px solid #D6D0C2;
  border-radius: 10px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.dark .combobox-dropdown {
  background: #1d201f;
  border-color: #404945;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);
}

.combobox-search {
  width: 100%;
  padding: 10px 12px;
  border: none;
  border-bottom: 1px solid #D6D0C2;
  background: transparent;
  font-size: 14px;
  font-family: inherit;
  color: #1e1b15;
  outline: none;
}

.combobox-search::placeholder {
  color: #9a8c7e;
}

.dark .combobox-search {
  border-bottom-color: #404945;
  color: #e1e3e1;
}

.dark .combobox-search::placeholder {
  color: #7a8280;
}

.combobox-list {
  max-height: 240px;
  overflow-y: auto;
}

.combobox-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 14px;
  color: #1e1b15;
  transition: background 0.1s;
}

.combobox-item:hover,
.combobox-item--active {
  background: #EDE8DE;
}

.dark .combobox-item {
  color: #e1e3e1;
}

.dark .combobox-item:hover,
.dark .combobox-item--active {
  background: #2a2d2c;
}

.combobox-item-label {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.combobox-item-desc {
  font-size: 12px;
  color: #9a8c7e;
  flex-shrink: 0;
}

.dark .combobox-item-desc {
  color: #7a8280;
}

.combobox-empty {
  padding: 12px;
  text-align: center;
  font-size: 13px;
  color: #9a8c7e;
}

.dark .combobox-empty {
  color: #7a8280;
}
</style>
