<template>
  <div class="page">

    <!-- Page header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Invoices</h1>
        <p class="page-sub">{{ store.invoices.length }} total invoice{{ store.invoices.length !== 1 ? 's' : '' }}</p>
      </div>
      <div class="header-actions">
        <router-link to="/app/invoices/new" class="btn-primary">
          <svg viewBox="0 0 24 24" fill="none" class="btn-icon">
            <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
            <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
          </svg>
          New Invoice
        </router-link>
      </div>
    </div>

    <!-- Toolbar: search + filters -->
    <div class="toolbar">
      <div class="search-wrap">
        <ion-icon :icon="searchOutline" class="search-icon" />
        <input
          class="search-input"
          v-model="search"
          placeholder="Search invoice # or client..."
        />
      </div>
      <div class="filter-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          class="filter-tab"
          :class="{ active: filter === tab.value }"
          @click="filter = tab.value"
        >
          {{ tab.label }}
          <span v-if="tab.count !== null" class="tab-count" :class="{ 'tab-count-active': filter === tab.value }">
            {{ tab.count }}
          </span>
        </button>
      </div>
    </div>

    <!-- Table -->
    <div class="section-card" v-if="filtered.length">
      <table class="data-table">
        <thead>
          <tr>
            <th>Invoice #</th>
            <th>Client</th>
            <th>Issue Date</th>
            <th>Due Date</th>
            <th>Amount</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="inv in filtered"
            :key="inv.id"
            class="table-row"
            @click="$router.push(`/app/invoices/${inv.id}`)"
          >
            <td class="td-mono">{{ inv.invoice_number }}</td>
            <td class="td-client">{{ inv.client?.name ?? '—' }}</td>
            <td class="td-muted">{{ formatDate(inv.issue_date) }}</td>
            <td class="td-muted">{{ formatDate(inv.due_date) }}</td>
            <td class="td-mono td-bold">{{ formatCurrency(inv.total, inv.currency) }}</td>
            <td>
              <span class="status-badge" :class="`status-${inv.status}`">{{ inv.status }}</span>
            </td>
            <td class="td-action">
              <ion-icon :icon="chevronForwardOutline" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty -->
    <div class="empty-state" v-else>
      <ion-icon :icon="documentTextOutline" class="empty-icon" />
      <p class="empty-title">
        {{ search || filter !== 'all' ? 'No matching invoices' : 'No invoices yet' }}
      </p>
      <p class="empty-sub">
        {{ search || filter !== 'all' ? 'Try adjusting your search or filter.' : 'Create your first invoice to get started.' }}
      </p>
      <router-link v-if="!search && filter === 'all'" to="/app/invoices/new" class="btn-primary" style="margin-top:8px;">
        Create Invoice
      </router-link>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { IonIcon } from '@ionic/vue'
import { searchOutline, documentTextOutline, chevronForwardOutline } from 'ionicons/icons'
import { useInvoiceStore } from '@/stores/invoices'
import { useFormatters } from '@/composables/useFormatters'

const store  = useInvoiceStore()
const { formatCurrency, formatDate } = useFormatters()
const search = ref('')
const filter = ref('all')

onMounted(() => store.fetchAll())

const tabs = computed(() => [
  { label: 'All',     value: 'all',     count: store.invoices.length },
  { label: 'Draft',   value: 'draft',   count: store.invoices.filter(i => i.status === 'draft').length },
  { label: 'Sent',    value: 'sent',    count: store.invoices.filter(i => i.status === 'sent').length },
  { label: 'Paid',    value: 'paid',    count: store.invoices.filter(i => i.status === 'paid').length },
  { label: 'Overdue', value: 'overdue', count: store.invoices.filter(i => i.status === 'overdue').length },
])

const filtered = computed(() =>
  store.invoices
    .filter(i => filter.value === 'all' || i.status === filter.value)
    .filter(i =>
      i.invoice_number.toLowerCase().includes(search.value.toLowerCase()) ||
      i.client?.name?.toLowerCase().includes(search.value.toLowerCase())
    )
)
</script>

<style scoped>
.page {
  padding: 32px 36px;
  max-width: 1200px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Header */
.page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
}

.page-title {
  font-size: 26px;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 2px;
  letter-spacing: -0.5px;
}

.page-sub {
  font-size: 13px;
  color: #94a3b8;
  margin: 0;
  font-weight: 500;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* Button */
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
  transition: opacity .15s, transform .1s;
  box-shadow: 0 2px 10px rgba(99,102,241,.35);
  font-family: inherit;
  white-space: nowrap;
}
.btn-primary:hover { opacity: .9; }
.btn-primary:active { transform: scale(.98); }
.btn-icon { width: 16px; height: 16px; flex-shrink: 0; }

/* Toolbar */
.toolbar {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.search-wrap {
  position: relative;
  flex: 1;
  min-width: 220px;
  max-width: 360px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 16px;
  color: #94a3b8;
  pointer-events: none;
}

.search-input {
  width: 100%;
  height: 38px;
  padding: 0 14px 0 38px;
  border: 1.5px solid #e2e8f0;
  border-radius: 9px;
  font-size: 14px;
  color: #0f172a;
  background: #ffffff;
  outline: none;
  font-family: inherit;
  transition: border-color .15s, box-shadow .15s;
}
.search-input:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99,102,241,.1);
}
.search-input::placeholder { color: #94a3b8; }

/* Filter tabs */
.filter-tabs {
  display: flex;
  gap: 4px;
}

.filter-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  background: #ffffff;
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  font-family: inherit;
  transition: all .12s;
  white-space: nowrap;
}
.filter-tab:hover { border-color: #c7d2fe; color: #4f46e5; background: #f5f3ff; }
.filter-tab.active { background: #6366f1; border-color: #6366f1; color: #ffffff; }

.tab-count {
  background: #f1f5f9;
  color: #64748b;
  border-radius: 4px;
  padding: 0 5px;
  font-size: 11px;
  font-weight: 700;
  min-width: 18px;
  text-align: center;
}
.tab-count-active {
  background: rgba(255,255,255,.25);
  color: #ffffff;
}

/* Section card */
.section-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,.05);
  overflow: hidden;
}

/* Table */
.data-table {
  width: 100%;
  border-collapse: collapse;
}

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

.table-row { cursor: pointer; transition: background .1s; }
.table-row:hover { background: #fafafa; }
.table-row:last-child td { border-bottom: none; }

.td-mono   { font-variant-numeric: tabular-nums; font-weight: 600; color: #0f172a; }
.td-client { font-weight: 500; color: #1e293b; }
.td-muted  { color: #94a3b8; font-size: 13px; }
.td-bold   { font-weight: 700; color: #0f172a; }
.td-action { color: #cbd5e1; font-size: 14px; width: 40px; text-align: right; }

/* Status badge */
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
  padding: 80px 20px;
  gap: 8px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
}
.empty-icon  { font-size: 52px; color: #cbd5e1; margin-bottom: 4px; }
.empty-title { font-size: 16px; font-weight: 700; color: #374151; margin: 0; }
.empty-sub   { font-size: 14px; color: #94a3b8; margin: 0; text-align: center; max-width: 320px; }

/* Responsive */
@media (max-width: 768px) {
  .page { padding: 20px 16px; }
  .page-title { font-size: 20px; }
  .toolbar { flex-direction: column; align-items: stretch; gap: 10px; }
  .search-wrap { max-width: 100%; }
  .filter-tabs { overflow-x: auto; padding-bottom: 2px; }
  .filter-tab { flex-shrink: 0; }
  .data-table th:nth-child(3),
  .data-table th:nth-child(4),
  .data-table td:nth-child(3),
  .data-table td:nth-child(4) { display: none; }
}
</style>
