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
  border: 1.5px solid #e5e5e5;
  border-radius: 8px;
  background-color: #ffffff;
  font-size: 13px;
  font-weight: 600;
  color: #404040;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
  line-height: 1;
}
.pg-btn:hover:not(:disabled):not(.pg-btn-active) {
  border-color: #08241f;
  color: #08241f;
  background-color: #cbe9e0;
}
.pg-btn-active {
  background-color: #08241f;
  border-color: #08241f;
  color: #ffffff;
}
.pg-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
:deep(.dark) .pg-btn {
  background-color: #171717;
  border-color: #262626;
  color: #e5e5e5;
}
:deep(.dark) .pg-btn:hover:not(:disabled):not(.pg-btn-active) {
  border-color: #14b8a6;
  color: #2dd4bf;
  background-color: #08241f;
}
:deep(.dark) .pg-btn-active {
  background-color: #08241f;
  border-color: #08241f;
  color: #ffffff;
}
</style>
