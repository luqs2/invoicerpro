<template>
  <div class="invoice-item" @click="go">
    <div class="item-left">
      <p class="inv-number">{{ invoice.invoice_number }}</p>
      <p class="inv-meta">{{ invoice.client?.name ?? 'Unknown Client' }} · {{ formatDate(invoice.issue_date) }}</p>
    </div>
    <div class="item-right">
      <p class="inv-amount">{{ formatCurrency(invoice.total, invoice.currency) }}</p>
      <span class="status-badge" :class="`status-${invoice.status}`">{{ invoice.status }}</span>
    </div>
    <ChevronRight :size="14" class="item-chevron" />
  </div>
</template>

<script setup lang="ts">
import { ChevronRight } from '@lucide/vue'
import { useRouter } from 'vue-router'
import type { Invoice } from '@/types'
import { useFormatters } from '@/composables/useFormatters'

const { formatCurrency, formatDate } = useFormatters()
const router = useRouter()
const props = defineProps<{ invoice: Invoice }>()

function go() {
  router.push(`/app/invoices/${props.invoice.id}`)
}
</script>

<style scoped>
.invoice-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  cursor: pointer;
  transition: background .12s;
  border-bottom: 1px solid #f1f5f9;
}

.invoice-item:last-child { border-bottom: none; }
.invoice-item:hover { background: #fafafa; }

.item-left {
  flex: 1;
  min-width: 0;
}

.inv-number {
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 3px;
  letter-spacing: -0.1px;
  font-variant-numeric: tabular-nums;
}

.inv-meta {
  font-size: 12px;
  color: #64748b;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  flex-shrink: 0;
}

.inv-amount {
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.2px;
}

.status-badge {
  font-size: 10px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 6px;
  text-transform: capitalize;
  letter-spacing: 0.3px;
}

.status-draft    { background: #f1f5f9; color: #64748b; }
.status-sent     { background: #dbeafe; color: #1d4ed8; }
.status-paid     { background: #d1fae5; color: #065f46; }
.status-overdue  { background: #fee2e2; color: #991b1b; }
.status-cancelled{ background: #f1f5f9; color: #94a3b8; }

.item-chevron { color: #cbd5e1; flex-shrink: 0; }
</style>
