<script setup lang="ts">
import type { PaginationNextProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import { ChevronRight } from "lucide-vue-next"
import { PaginationNext, useForwardProps } from "reka-ui"
import { cn } from "@/lib/utils"

const props = withDefaults(defineProps<PaginationNextProps & {
  class?: HTMLAttributes["class"]
}>(), {})

const delegatedProps = reactiveOmit(props, "class")
const forwarded = useForwardProps(delegatedProps)
</script>

<template>
  <PaginationNext
    data-slot="pagination-next"
    :class="cn('pg-btn', props.class)"
    v-bind="forwarded"
  >
    <slot>
      <ChevronRight :size="16" />
    </slot>
  </PaginationNext>
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
  gap: 4px;
}
.pg-btn:hover:not(:disabled) {
  border-color: #c7d2fe;
  color: #4f46e5;
  background-color: #f5f3ff;
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
:deep(.dark) .pg-btn:hover:not(:disabled) {
  border-color: #4f46e5;
  color: #818cf8;
  background-color: #312e81;
}
</style>
