<template>
  <div class="page">

    <!-- Page header -->
    <div class="page-header">
      <div class="page-header-left">
        <p class="page-eyebrow">Good {{ timeOfDay }}</p>
        <h1 class="page-title">Dashboard</h1>
      </div>
      <div class="page-header-right">
        <router-link to="/app/invoices/new" class="btn-primary">
          <svg viewBox="0 0 24 24" fill="none" class="btn-icon">
            <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
            <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
          </svg>
          New Invoice
        </router-link>
      </div>
    </div>

    <!-- Stats row -->
    <div class="stats-row" v-if="!loading">
      <div class="stat-card">
        <div class="stat-icon-wrap" style="background:#ede9fe;">
          <DollarSign :size="22" style="color:#6366f1;" />
        </div>
        <div class="stat-body">
          <p class="stat-label">Total Revenue</p>
          <p class="stat-value">{{ formatCurrency(stats.total_revenue) }}</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon-wrap" style="background:#dbeafe;">
          <FileText :size="22" style="color:#3b82f6;" />
        </div>
        <div class="stat-body">
          <p class="stat-label">Invoices Sent</p>
          <p class="stat-value">{{ stats.invoices_sent }}</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon-wrap" style="background:#fef3c7;">
          <Clock :size="22" style="color:#f59e0b;" />
        </div>
        <div class="stat-body">
          <p class="stat-label">Awaiting Payment</p>
          <p class="stat-value">{{ formatCurrency(stats.pending_amount) }}</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon-wrap" style="background:#fee2e2;">
          <AlertCircle :size="22" style="color:#ef4444;" />
        </div>
        <div class="stat-body">
          <p class="stat-label">Overdue</p>
          <p class="stat-value overdue">{{ formatCurrency(stats.overdue_amount) }}</p>
        </div>
      </div>
    </div>

    <!-- Stats skeleton -->
    <div class="stats-row" v-else>
      <div class="stat-card" v-for="i in 4" :key="i">
        <Skeleton variant="rect" width="44px" height="44px" style="border-radius:12px; flex-shrink:0;" />
        <div class="stat-body" style="flex:1;">
          <Skeleton variant="text" width="80px" />
          <Skeleton variant="title" width="100px" />
        </div>
      </div>
    </div>

    <!-- Recent invoices table -->
    <div class="section-card">
      <div class="section-head">
        <h2 class="section-title">Recent Invoices</h2>
        <router-link to="/app/invoices" class="see-all-link">
          View all
          <ArrowRight :size="14" />
        </router-link>
      </div>

      <div v-if="loading" style="padding: 16px 24px;">
        <div v-for="i in 5" :key="i" style="display:flex; align-items:center; gap:16px; padding:14px 0; border-bottom:1px solid #f8fafc;">
          <Skeleton variant="text" width="80px" />
          <Skeleton variant="text" width="120px" />
          <Skeleton variant="text" width="90px" style="margin-left:auto;" />
          <Skeleton variant="text" width="60px" />
        </div>
      </div>
      <div v-else-if="invoiceStore.invoices.length">
        <table class="data-table">
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Client</th>
              <th>Date</th>
              <th>Due Date</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="inv in invoiceStore.invoices.slice(0, 8)"
              :key="inv.id"
              class="table-row"
              @click="$router.push(`/app/invoices/${inv.id}`)"
            >
              <td class="td-mono">{{ inv.invoice_number }}</td>
              <td>{{ inv.client?.name ?? '—' }}</td>
              <td class="td-muted">{{ formatDate(inv.issue_date) }}</td>
              <td class="td-muted">{{ formatDate(inv.due_date) }}</td>
              <td class="td-mono td-bold">{{ formatCurrency(inv.total, inv.currency) }}</td>
              <td>
                <span class="status-badge" :class="`status-${inv.status}`">{{ inv.status }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="empty-state" v-else-if="!loading">
        <FileText :size="48" class="empty-icon" />
        <p class="empty-title">No invoices yet</p>
        <p class="empty-sub">Create your first invoice to start tracking revenue.</p>
        <router-link to="/app/invoices/new" class="btn-primary" style="margin-top:8px;">
          Create Invoice
        </router-link>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, computed } from 'vue'
import { DollarSign, FileText, Clock, AlertCircle, ArrowRight } from '@lucide/vue'
import { useInvoiceStore } from '@/stores/invoices'
import { useFormatters } from '@/composables/useFormatters'
import Skeleton from '@/components/ui/Skeleton.vue'

const invoiceStore = useInvoiceStore()
const { formatCurrency, formatDate } = useFormatters()

const stats = reactive({
  total_revenue:  0,
  invoices_sent:  0,
  pending_amount: 0,
  overdue_amount: 0,
})

const loading = computed(() => invoiceStore.loading)

const timeOfDay = computed(() => {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
})

onMounted(async () => {
  await invoiceStore.fetchAll()
  stats.invoices_sent  = invoiceStore.invoices.length
  stats.total_revenue  = invoiceStore.invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.total, 0)
  stats.pending_amount = invoiceStore.invoices.filter(i => i.status === 'sent').reduce((s, i) => s + i.total, 0)
  stats.overdue_amount = invoiceStore.invoices.filter(i => i.status === 'overdue').reduce((s, i) => s + i.total, 0)
})
</script>

<style scoped>
.page {
  padding: 32px 36px;
  max-width: 1200px;
  display: flex;
  flex-direction: column;
  gap: 28px;
}

/* Page header */
.page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
}

.page-eyebrow {
  font-size: 13px;
  color: #64748b;
  margin: 0 0 4px;
  text-transform: capitalize;
  font-weight: 500;
}

.page-title {
  font-size: 26px;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
  letter-spacing: -0.5px;
}

/* Primary button */
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
  letter-spacing: 0.1px;
  transition: opacity .15s, transform .1s;
  box-shadow: 0 2px 10px rgba(99,102,241,.35);
  font-family: inherit;
  white-space: nowrap;
}
.btn-primary:hover { opacity: .9; }
.btn-primary:active { transform: scale(.98); }

.btn-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

/* Stats */
.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.stat-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,.05);
  transition: box-shadow .15s;
}
.dark .stat-card { background: #1e293b; border-color: #334155; }

.stat-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,.08); }

.stat-icon-wrap {
  width: 44px;
  height: 44px;
  min-width: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-label {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 4px;
}

.stat-value {
  font-size: 22px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
  letter-spacing: -0.4px;
  font-variant-numeric: tabular-nums;
}
.dark .stat-value { color: #f1f5f9; }

.stat-value.overdue { color: #ef4444; }

/* Section card */
.section-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,.05);
  overflow: hidden;
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 16px;
  border-bottom: 1px solid #f1f5f9;
}

.section-title {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
  letter-spacing: -0.2px;
}

.see-all-link {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  font-weight: 600;
  color: #6366f1;
  text-decoration: none;
}
.see-all-link:hover { text-decoration: underline; }

/* Table */
.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table thead tr {
  border-bottom: 1px solid #f1f5f9;
}

.data-table th {
  padding: 10px 16px 10px 24px;
  font-size: 11px;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  text-align: left;
}

.data-table td {
  padding: 14px 16px 14px 24px;
  font-size: 14px;
  color: #374151;
  border-bottom: 1px solid #f8fafc;
}

.table-row {
  cursor: pointer;
  transition: background .1s;
}
.table-row:hover { background: #fafafa; }
.table-row:last-child td { border-bottom: none; }

.td-mono { font-variant-numeric: tabular-nums; font-weight: 600; color: #0f172a; }
.td-muted { color: #94a3b8; font-size: 13px; }
.td-bold { font-weight: 700; color: #0f172a; }

/* Status badges */
.status-badge {
  display: inline-block;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: 6px;
  text-transform: capitalize;
  letter-spacing: 0.2px;
}
.status-draft    { background: #f1f5f9; color: #64748b; }
.status-sent     { background: #dbeafe; color: #1d4ed8; }
.status-paid     { background: #d1fae5; color: #065f46; }
.status-overdue  { background: #fee2e2; color: #991b1b; }
.status-cancelled{ background: #f1f5f9; color: #94a3b8; }

/* Empty state */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 20px;
  gap: 8px;
}
.empty-icon { font-size: 48px; color: #cbd5e1; margin-bottom: 4px; }
.empty-title { font-size: 16px; font-weight: 700; color: #374151; margin: 0; }
.empty-sub { font-size: 14px; color: #94a3b8; margin: 0; text-align: center; max-width: 320px; }

/* Responsive */
@media (max-width: 1024px) {
  .stats-row { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 768px) {
  .page { padding: 20px 16px; gap: 20px; }
  .page-title { font-size: 20px; }
  .stats-row { grid-template-columns: 1fr 1fr; gap: 10px; }
  .stat-card { padding: 14px; gap: 10px; }
  .stat-value { font-size: 18px; }
  .data-table th:nth-child(3),
  .data-table th:nth-child(4),
  .data-table td:nth-child(3),
  .data-table td:nth-child(4) { display: none; }
}
</style>
