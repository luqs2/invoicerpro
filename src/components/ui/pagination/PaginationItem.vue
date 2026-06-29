<script setup lang="ts">
import type { PaginationListItemProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import { PaginationListItem } from "reka-ui"
import { cn } from "@/lib/utils"

const props = withDefaults(defineProps<PaginationListItemProps & {
  class?: HTMLAttributes["class"]
  isActive?: boolean
}>(), {})

const delegatedProps = reactiveOmit(props, "class", "isActive")
</script>

<template>
  <PaginationListItem
    data-slot="pagination-item"
    v-bind="delegatedProps"
    :class="cn('pg-btn', isActive && 'pg-btn-active', props.class)"
  >
    <slot />
  </PaginationListItem>
</template>

<style scoped>
.pg-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  height: 36px;
  padding: 0 8px;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  background-color: #ffffff;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
  line-height: 1;
}
.pg-btn:hover:not(:disabled):not(.pg-btn-active) {
  border-color: #c7d2fe;
  color: #4f46e5;
  background-color: #f5f3ff;
}
.pg-btn-active {
  background-color: #6366f1;
  border-color: #6366f1;
  color: #ffffff;
}
.pg-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
:deep(.dark) .pg-btn {
  background-color: #1e293b;
  border-color: #334155;
  color: #e2e8f0;
}
:deep(.dark) .pg-btn:hover:not(:disabled):not(.pg-btn-active) {
  border-color: #4f46e5;
  color: #818cf8;
  background-color: #312e81;
}
:deep(.dark) .pg-btn-active {
  background-color: #6366f1;
  border-color: #6366f1;
  color: #ffffff;
}
</style>
