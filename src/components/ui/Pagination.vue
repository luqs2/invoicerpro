<template>
  <div class="pagination-wrapper" v-if="total > pageSize">
    <div class="pagination-info">
      <span class="pagination-text">
        Showing {{ startItem }}–{{ endItem }} of {{ total }}
      </span>
    </div>
    <Pagination
      v-slot="{ page }"
      :items-per-page="pageSize"
      :total="total"
      :page="currentPage"
      @update:page="$emit('update:currentPage', $event)"
    >
      <PaginationContent v-slot="{ items }">
        <PaginationPrevious
          :disabled="currentPage === 1"
          @click="$emit('update:currentPage', currentPage - 1)"
        />
        <template v-for="(item, index) in items" :key="index">
          <PaginationItem
            v-if="item.type === 'page'"
            :value="item.value"
            :is-active="item.value === page"
            @click="$emit('update:currentPage', item.value)"
          >
            {{ item.value }}
          </PaginationItem>
        </template>
        <PaginationNext
          :disabled="currentPage === totalPages"
          @click="$emit('update:currentPage', currentPage + 1)"
        />
      </PaginationContent>
    </Pagination>
    <div class="pagination-size">
      <label class="size-label" for="page-size-select">Per page:</label>
      <select
        id="page-size-select"
        class="size-select"
        :value="pageSize"
        @change="$emit('update:pageSize', Number(($event.target as HTMLSelectElement).value))"
      >
        <option v-for="s in pageSizeOptions" :key="s" :value="s">{{ s }}</option>
      </select>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'

const props = withDefaults(defineProps<{
  currentPage: number
  total: number
  pageSize?: number
  pageSizeOptions?: number[]
}>(), {
  pageSize: 10,
  pageSizeOptions: () => [10, 25, 50, 100],
})

defineEmits<{
  'update:currentPage': [page: number]
  'update:pageSize': [size: number]
}>()

const totalPages = computed(() => Math.ceil(props.total / props.pageSize))

const startItem = computed(() => {
  if (props.total === 0) return 0
  return (props.currentPage - 1) * props.pageSize + 1
})

const endItem = computed(() => {
  return Math.min(props.currentPage * props.pageSize, props.total)
})
</script>

<style scoped>
.pagination-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  border-top: 1px solid #f1f5f9;
  gap: 16px;
  flex-wrap: wrap;
}

.pagination-info {
  flex-shrink: 0;
}

.pagination-text {
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
}

.pagination-size {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.size-label {
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
  white-space: nowrap;
}

.size-select {
  height: 34px;
  padding: 0 28px 0 10px;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  font-family: inherit;
  cursor: pointer;
  outline: none;
  transition: border-color .15s;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 8px center;
}

.size-select:focus {
  border-color: #6366f1;
}

@media (max-width: 768px) {
  .pagination-wrapper {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
    padding: 12px 16px;
  }

  .pagination-info,
  .pagination-size {
    justify-content: center;
    text-align: center;
  }
}
</style>
