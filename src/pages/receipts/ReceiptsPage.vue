<template>
  <div class="page">

    <div class="page-header">
      <div>
        <h1 class="page-title">Receipts</h1>
        <p class="page-sub">{{ receipts.length }} receipt{{ receipts.length !== 1 ? 's' : '' }}</p>
      </div>
      <router-link to="/app/receipts/new" class="btn-primary">
        <Plus :size="15" />
        New Receipt
      </router-link>
    </div>

    <div class="section-card" v-if="receipts.length">
      <table class="data-table">
        <thead>
          <tr>
            <th>Receipt #</th>
            <th>Client</th>
            <th>Payment Date</th>
            <th>Method</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in receipts" :key="r.id" class="table-row">
            <td class="td-mono">{{ r.receipt_number }}</td>
            <td class="td-client">{{ r.client?.name ?? '—' }}</td>
            <td class="td-muted">{{ formatDate(r.payment_date) }}</td>
            <td>
              <UiBadge :variant="methodVariant(r.payment_method)">{{ methodLabel(r.payment_method) }}</UiBadge>
            </td>
            <td class="td-mono td-bold">{{ formatCurrency(r.amount, r.currency) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="empty-state" v-else>
      <FileText :size="52" class="empty-icon" />
      <p class="empty-title">No receipts yet</p>
      <p class="empty-sub">Create a receipt to record a payment.</p>
      <router-link to="/app/receipts/new" class="btn-primary" style="margin-top:8px;">
        New Receipt
      </router-link>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Plus, FileText } from '@lucide/vue'
import { receiptService } from '@/services/receipts'
import { useAuthStore } from '@/stores/auth'
import { useFormatters } from '@/composables/useFormatters'
import UiBadge from '@/components/ui/Badge.vue'

const auth = useAuthStore()
const { formatCurrency, formatDate } = useFormatters()

const receipts = ref<any[]>([])

onMounted(async () => {
  if (!auth.user) return
  const { data } = await receiptService.getAll(auth.user.id)
  receipts.value = data ?? []
})

function methodLabel(m: string) {
  const map: Record<string, string> = {
    bank_transfer: 'Bank Transfer',
    cash:          'Cash',
    online:        'Online',
    card:          'Card',
  }
  return map[m] ?? m
}

function methodVariant(m: string): 'success' | 'default' | 'sent' | 'warning' {
  return { bank_transfer: 'success', online: 'sent', cash: 'default', card: 'warning' }[m] as any ?? 'default'
}
</script>

<style scoped>
.page {
  padding: 32px 36px;
  max-width: 1100px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
}

.page-title { font-size: 26px; font-weight: 800; color: #0f172a; margin: 0 0 2px; letter-spacing: -0.5px; }
.page-sub   { font-size: 13px; color: #94a3b8; margin: 0; font-weight: 500; }

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 9px 18px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #ffffff;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  transition: opacity .15s;
  box-shadow: 0 2px 10px rgba(99,102,241,.35);
  font-family: inherit;
}
.btn-primary:hover { opacity: .9; }

.section-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,.05);
  overflow: hidden;
}

.data-table { width: 100%; border-collapse: collapse; }
.data-table thead tr { border-bottom: 1px solid #f1f5f9; }
.data-table th {
  padding: 11px 16px 11px 20px;
  font-size: 11px;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  text-align: left;
  background: #fafafa;
}
.data-table td {
  padding: 14px 16px 14px 20px;
  font-size: 14px;
  color: #374151;
  border-bottom: 1px solid #f8fafc;
}
.table-row { transition: background .1s; }
.table-row:hover { background: #fafafa; }
.table-row:last-child td { border-bottom: none; }
.td-mono   { font-variant-numeric: tabular-nums; font-weight: 600; color: #0f172a; }
.td-client { font-weight: 500; color: #1e293b; }
.td-muted  { color: #94a3b8; font-size: 13px; }
.td-bold   { font-weight: 700; color: #0f172a; }

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80px 20px;
  gap: 8px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
}
.empty-icon  { color: #cbd5e1; margin-bottom: 4px; }
.empty-title { font-size: 16px; font-weight: 700; color: #374151; margin: 0; }
.empty-sub   { font-size: 14px; color: #94a3b8; margin: 0; }

@media (max-width: 768px) {
  .page { padding: 20px 16px; }
}
</style>
