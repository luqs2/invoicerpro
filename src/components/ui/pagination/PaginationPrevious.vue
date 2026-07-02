<script setup lang="ts">
import type { PaginationPrevProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import { ChevronLeft } from "lucide-vue-next"
import { PaginationPrev, useForwardProps } from "reka-ui"
import { cn } from "@/lib/utils"

const props = withDefaults(defineProps<PaginationPrevProps & {
  class?: HTMLAttributes["class"]
}>(), {})

const delegatedProps = reactiveOmit(props, "class")
const forwarded = useForwardProps(delegatedProps)
</script>

<template>
  <PaginationPrev
    data-slot="pagination-previous"
    :class="cn('pg-btn', props.class)"
    v-bind="forwarded"
  >
    <slot>
      <ChevronLeft :size="16" />
    </slot>
  </PaginationPrev>
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
  gap: 4px;
}
.pg-btn:hover:not(:disabled) {
  border-color: #08241f;
  color: #08241f;
  background-color: #cbe9e0;
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
:deep(.dark) .pg-btn:hover:not(:disabled) {
  border-color: #14b8a6;
  color: #2dd4bf;
  background-color: #08241f;
}
</style>
