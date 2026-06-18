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
          <Plus :size="15" />
          New Invoice
        </router-link>
      </div>
    </div>

    <!-- Toolbar: search + filters -->
    <div class="toolbar">
      <div class="search-wrap">
        <Search :size="15" class="search-icon" />
        <input class="search-input" v-model="search" placeholder="Search invoice # or client…" />
      </div>
      <button class="filter-toggle" @click="showFilters = !showFilters" :class="{ active: hasActiveFilters }">
        <SlidersHorizontal :size="14" />
        Filters
        <span v-if="hasActiveFilters" class="filter-active-dot" />
      </button>
      <div class="filter-tabs">
        <button
          v-for="t in tabs" :key="t.value"
          class="filter-tab" :class="{ active: filter === t.value }"
          @click="filter = t.value"
        >
          {{ t.label }}
          <span class="tab-count" :class="{ 'tab-count-active': filter === t.value }">{{ t.count }}</span>
        </button>
      </div>
    </div>

    <!-- Advanced filters -->
    <div class="advanced-filters" v-if="showFilters">
      <div class="af-row">
        <div class="af-field">
          <label>From Date</label>
          <input type="date" v-model="dateFrom" class="af-input" />
        </div>
        <div class="af-field">
          <label>To Date</label>
          <input type="date" v-model="dateTo" class="af-input" />
        </div>
        <div class="af-field">
          <label>Min Amount</label>
          <input type="number" v-model.number="minAmount" min="0" step="0.01" placeholder="0" class="af-input" />
        </div>
        <div class="af-field">
          <label>Max Amount</label>
          <input type="number" v-model.number="maxAmount" min="0" step="0.01" placeholder="∞" class="af-input" />
        </div>
        <button v-if="hasActiveFilters" class="af-clear" @click="clearFilters">Clear</button>
      </div>
    </div>

    <!-- Table skeleton -->
    <div class="section-card" v-if="store.loading">
      <div style="padding: 16px 20px;">
        <div v-for="i in 5" :key="i" style="display:flex; align-items:center; gap:16px; padding:14px 0; border-bottom:1px solid #f8fafc;">
          <Skeleton variant="text" width="80px" />
          <Skeleton variant="text" width="120px" />
          <Skeleton variant="text" width="90px" />
          <Skeleton variant="text" width="60px" style="margin-left:auto;" />
        </div>
      </div>
    </div>

    <!-- Bulk action bar -->
    <div class="bulk-bar" v-if="selectedIds.size > 0">
      <div class="bulk-left">
        <CheckSquare :size="16" />
        <span>{{ selectedIds.size }} selected</span>
      </div>
      <div class="bulk-actions">
        <button class="bulk-btn" @click="bulkExport">
          <Download :size="14" />
          Export PDFs
        </button>
        <button class="bulk-btn bulk-btn-danger" @click="bulkDelete">
          <Trash2 :size="14" />
          Delete
        </button>
      </div>
    </div>

    <!-- Table -->
    <div class="section-card" v-if="filtered.length">
      <table class="data-table">
          <caption class="sr-only">Invoices</caption>
          <thead>
            <tr>
              <th scope="col" style="width:40px; padding-left:16px;">
                <input type="checkbox" v-model="selectAll" class="select-cb" aria-label="Select all" />
              </th>
              <th scope="col">Invoice #</th>
              <th scope="col">Client</th>
              <th scope="col">Issue Date</th>
              <th scope="col">Due Date</th>
              <th scope="col">Amount</th>
              <th scope="col">Status</th>
              <th scope="col" style="width:120px; text-align:right; padding-right:20px;">Actions</th>
            </tr>
          </thead>
        <tbody>
          <tr v-for="inv in filtered" :key="inv.id" class="table-row">
            <td style="padding-left:16px;">
              <input type="checkbox" :checked="selectedIds.has(inv.id)" @change="toggleSelect(inv.id)" class="select-cb" :aria-label="`Select ${inv.invoice_number}`" />
            </td>
            <td class="td-mono">{{ inv.invoice_number }}</td>
            <td class="td-client">{{ inv.client?.name ?? '—' }}</td>
            <td class="td-muted">{{ formatDate(inv.issue_date) }}</td>
            <td class="td-muted">{{ formatDate(inv.due_date) }}</td>
            <td class="td-mono td-bold">{{ formatCurrency(inv.total, inv.currency) }}</td>
            <td>
              <span class="status-badge" :class="`status-${inv.status}`">{{ inv.status }}</span>
            </td>
            <td class="td-actions">
              <button class="act-btn act-view"  @click="viewInvoice(inv)"   title="View" :aria-label="`View ${inv.invoice_number}`">
                <Eye :size="14" />
              </button>
              <button class="act-btn act-edit"  @click="editInvoice(inv)"   title="Edit" :aria-label="`Edit ${inv.invoice_number}`">
                <Pencil :size="14" />
              </button>
              <button class="act-btn act-del"   @click="deleteInvoice(inv)" title="Delete" :aria-label="`Delete ${inv.invoice_number}`">
                <Trash2 :size="14" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty -->
    <div class="empty-state" v-else>
      <FileText :size="52" class="empty-icon" />
      <p class="empty-title">{{ search || filter !== 'all' ? 'No matching invoices' : 'No invoices yet' }}</p>
      <p class="empty-sub">{{ search || filter !== 'all' ? 'Try adjusting your search or filter.' : 'Create your first invoice to get started.' }}</p>
      <router-link v-if="!search && filter === 'all'" to="/app/invoices/new" class="btn-primary" style="margin-top:8px;">
        New Invoice
      </router-link>
    </div>

    <!-- View modal -->
    <div class="modal-overlay" v-if="viewing" @click.self="viewing = null">
      <div class="modal">
        <div class="modal-header">
          <div class="modal-title-group">
            <span class="status-badge" :class="`status-${viewing.status}`">{{ viewing.status }}</span>
            <h2 class="modal-title">{{ viewing.invoice_number }}</h2>
          </div>
          <div class="modal-header-actions">
            <button class="modal-act-btn" @click="exportInvoicePdf(viewing)" title="Export PDF" aria-label="Export PDF">
              <Download :size="15" />
            </button>
            <button class="modal-act-btn" @click="editInvoice(viewing); viewing = null" title="Edit" aria-label="Edit invoice">
              <Pencil :size="15" />
            </button>
            <button class="modal-close" @click="viewing = null" aria-label="Close preview">
              ✕
            </button>
          </div>
        </div>
        <div class="modal-body">
          <InvoicePreview id="invoice-preview-modal" :invoice="viewing" :template="templateStore.active" />
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, defineAsyncComponent } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, Search, FileText, Eye, Pencil, Trash2, Download, SlidersHorizontal, CheckSquare } from '@lucide/vue'
import confetti from 'canvas-confetti'
import { useInvoiceStore }  from '@/stores/invoices'
import { useTemplateStore } from '@/stores/templates'
import { invoiceService }   from '@/services/invoices'
import { useFormatters }    from '@/composables/useFormatters'
import { useToast }         from '@/composables/useToast'
import { usePdf }           from '@/composables/usePdf'
import { useConfirm }       from '@/composables/useConfirm'
import { useEscapeKey }     from '@/composables/useFocusTrap'
import Skeleton from '@/components/ui/Skeleton.vue'
import type { Invoice } from '@/types'

const InvoicePreview = defineAsyncComponent(() => import('@/components/invoice/InvoicePreview.vue'))

const router        = useRouter()
const store         = useInvoiceStore()
const templateStore = useTemplateStore()
const { formatCurrency, formatDate } = useFormatters()
const { showToast } = useToast()
const { exportToPdf } = usePdf()
const { confirm } = useConfirm()

const search  = ref('')
const filter  = ref('all')
const viewing = ref<Invoice | null>(null)
const showFilters = ref(false)
const dateFrom = ref('')
const dateTo = ref('')
const minAmount = ref<number | null>(null)
const maxAmount = ref<number | null>(null)

useEscapeKey(() => {
  if (viewing.value) viewing.value = null
})

const selectedIds = ref<Set<string>>(new Set())
const selectAll = computed({
  get: () => filtered.value.length > 0 && filtered.value.every(i => selectedIds.value.has(i.id)),
  set: (val: boolean) => {
    if (val) {
      selectedIds.value = new Set(filtered.value.map(i => i.id))
    } else {
      selectedIds.value = new Set()
    }
  },
})

function toggleSelect(id: string) {
  const s = new Set(selectedIds.value)
  if (s.has(id)) s.delete(id)
  else s.add(id)
  selectedIds.value = s
}

const hasActiveFilters = computed(() =>
  !!dateFrom.value || !!dateTo.value || minAmount.value !== null || maxAmount.value !== null
)

function clearFilters() {
  dateFrom.value = ''
  dateTo.value = ''
  minAmount.value = null
  maxAmount.value = null
}

async function bulkDelete() {
  const count = selectedIds.value.size
  const ok = await confirm({
    title: `Delete ${count} invoice${count > 1 ? 's' : ''}`,
    message: `This will permanently delete ${count} invoice${count > 1 ? 's' : ''}. This cannot be undone.`,
    confirmText: 'Delete All',
    variant: 'danger',
  })
  if (!ok) return

  for (const id of selectedIds.value) {
    await invoiceService.delete(id)
    store.invoices = store.invoices.filter(i => i.id !== id)
  }
  selectedIds.value = new Set()
  showToast(`${count} invoice${count > 1 ? 's' : ''} deleted`)
}

async function bulkExport() {
  for (const id of selectedIds.value) {
    const inv = store.invoices.find(i => i.id === id)
    if (inv) {
      viewing.value = inv
      await nextTick()
      await exportInvoicePdf(inv)
    }
  }
  viewing.value = null
  showToast('PDFs exported!')
}

onMounted(() => {
  store.fetchAll()
  templateStore.fetchAll()
})

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
      (i.client?.name ?? '').toLowerCase().includes(search.value.toLowerCase())
    )
    .filter(i => {
      if (dateFrom.value && i.issue_date < dateFrom.value) return false
      if (dateTo.value && i.issue_date > dateTo.value) return false
      if (minAmount.value !== null && i.total < minAmount.value) return false
      if (maxAmount.value !== null && i.total > maxAmount.value) return false
      return true
    })
)

function viewInvoice(inv: Invoice) {
  viewing.value = inv
}

function editInvoice(inv: Invoice) {
  // Clear current so stale data doesn't flash before load
  store.current = {}
  router.push(`/app/invoices/${inv.id}`)
}

async function deleteInvoice(inv: Invoice) {
  const ok = await confirm({
    title: 'Delete invoice',
    message: `Delete invoice ${inv.invoice_number}? This cannot be undone.`,
    confirmText: 'Delete',
    variant: 'danger',
  })
  if (!ok) return
  const { error } = await invoiceService.delete(inv.id)
  if (error) { showToast('Failed to delete invoice', 'danger'); return }
  store.invoices = store.invoices.filter(i => i.id !== inv.id)
  showToast('Invoice deleted')
}

async function exportInvoicePdf(inv: Invoice) {
  await exportToPdf('invoice-preview-modal', inv.invoice_number ?? 'invoice')
  showToast('PDF exported!')
}
</script>

<style scoped>
.page {
  padding: 32px 36px;
  max-width: 1200px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.page-header { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; }
.page-title  { font-size: 26px; font-weight: 800; color: #0f172a; margin: 0 0 2px; letter-spacing: -0.5px; }
.page-sub    { font-size: 13px; color: #94a3b8; margin: 0; font-weight: 500; }
.header-actions { display: flex; align-items: center; gap: 10px; }

.btn-primary {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 9px 18px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff; border: none; border-radius: 10px;
  font-size: 14px; font-weight: 600; cursor: pointer;
  text-decoration: none; transition: opacity .15s;
  box-shadow: 0 2px 10px rgba(99,102,241,.35); font-family: inherit;
}
.btn-primary:hover { opacity: .9; }

/* Toolbar */
.toolbar { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }

.filter-toggle {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  font-family: inherit;
  transition: all .12s;
  white-space: nowrap;
  position: relative;
}
.filter-toggle:hover { border-color: #c7d2fe; color: #4f46e5; }
.filter-toggle.active { background: #f5f3ff; border-color: #c7d2fe; color: #4f46e5; }

.filter-active-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #6366f1;
}

/* Advanced filters */
.advanced-filters {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 14px 18px;
}

.af-row {
  display: flex;
  align-items: flex-end;
  gap: 14px;
  flex-wrap: wrap;
}

.af-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 140px;
}

.af-field label {
  font-size: 11px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.af-input {
  height: 34px;
  padding: 0 10px;
  border: 1.5px solid #e2e8f0;
  border-radius: 7px;
  font-size: 13px;
  color: #0f172a;
  background: #fff;
  outline: none;
  font-family: inherit;
  transition: border-color .15s;
}
.af-input:focus { border-color: #6366f1; }

.af-clear {
  height: 34px;
  padding: 0 12px;
  border: none;
  border-radius: 7px;
  background: #fee2e2;
  color: #991b1b;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: background .12s;
}
.af-clear:hover { background: #fecaca; }

.search-wrap { position: relative; flex: 1; min-width: 220px; max-width: 360px; }
.search-icon { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); color: #94a3b8; pointer-events: none; }
.search-input {
  width: 100%; height: 38px; padding: 0 14px 0 36px;
  border: 1.5px solid #e2e8f0; border-radius: 9px;
  font-size: 14px; color: #0f172a; background: #fff;
  outline: none; font-family: inherit; transition: border-color .15s, box-shadow .15s;
}
.search-input:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,.1); }
.search-input::placeholder { color: #94a3b8; }

.filter-tabs { display: flex; gap: 4px; }
.filter-tab {
  display: flex; align-items: center; gap: 6px;
  padding: 6px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px;
  background: #fff; font-size: 13px; font-weight: 600; color: #64748b;
  cursor: pointer; font-family: inherit; transition: all .12s; white-space: nowrap;
}
.filter-tab:hover { border-color: #c7d2fe; color: #4f46e5; background: #f5f3ff; }
.filter-tab.active { background: #6366f1; border-color: #6366f1; color: #fff; }
.tab-count { background: #f1f5f9; color: #64748b; border-radius: 4px; padding: 0 5px; font-size: 11px; font-weight: 700; min-width: 18px; text-align: center; }
.tab-count-active { background: rgba(255,255,255,.25); color: #fff; }

/* Table */
.section-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; box-shadow: 0 1px 3px rgba(0,0,0,.05); overflow: hidden; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table thead tr { border-bottom: 1px solid #f1f5f9; }
.data-table th { padding: 11px 16px 11px 20px; font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; text-align: left; background: #fafafa; }
.data-table td { padding: 14px 16px 14px 20px; font-size: 14px; color: #374151; border-bottom: 1px solid #f8fafc; }
.table-row { transition: background .1s; }
.table-row:hover { background: #fafafa; }
.table-row:last-child td { border-bottom: none; }
.td-mono   { font-variant-numeric: tabular-nums; font-weight: 600; color: #0f172a; }
.td-client { font-weight: 500; color: #1e293b; }
.td-muted  { color: #94a3b8; font-size: 13px; }
.td-bold   { font-weight: 700; }

/* Row action buttons */
.td-actions { text-align: right; padding-right: 16px; white-space: nowrap; }
.act-btn {
  display: inline-flex; align-items: center; justify-content: center;
  width: 30px; height: 30px; border: none; background: none;
  cursor: pointer; border-radius: 7px; transition: color .12s, background .12s;
  color: #94a3b8;
}
.act-btn:hover { color: #0f172a; background: #f1f5f9; }
.act-del:hover { color: #ef4444 !important; background: #fee2e2 !important; }

/* Status badge */
.status-badge { display: inline-block; font-size: 11px; font-weight: 700; padding: 3px 9px; border-radius: 6px; text-transform: capitalize; letter-spacing: 0.2px; }
.status-draft    { background: #f1f5f9; color: #64748b; }
.status-sent     { background: #dbeafe; color: #1d4ed8; }
.status-paid     { background: #d1fae5; color: #065f46; }
.status-overdue  { background: #fee2e2; color: #991b1b; }
.status-cancelled{ background: #f1f5f9; color: #94a3b8; }

/* Empty state */
.empty-state { display: flex; flex-direction: column; align-items: center; padding: 80px 20px; gap: 8px; background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; }
.empty-icon  { color: #cbd5e1; margin-bottom: 4px; }
.empty-title { font-size: 16px; font-weight: 700; color: #374151; margin: 0; }
.empty-sub   { font-size: 14px; color: #94a3b8; margin: 0; text-align: center; max-width: 320px; }

/* Bulk actions */
.bulk-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: #f5f3ff;
  border: 1.5px solid #c7d2fe;
  border-radius: 12px;
}

.bulk-left {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #4f46e5;
}

.bulk-actions {
  display: flex;
  gap: 8px;
}

.bulk-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  cursor: pointer;
  font-family: inherit;
  transition: all .12s;
}
.bulk-btn:hover { background: #f8fafc; border-color: #c7d2fe; }

.bulk-btn-danger {
  border-color: #fecaca;
  color: #991b1b;
}
.bulk-btn-danger:hover { background: #fee2e2; border-color: #fca5a5; }

.select-cb {
  width: 16px;
  height: 16px;
  accent-color: #6366f1;
  cursor: pointer;
}

/* Modal */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(15,23,42,.45);
  backdrop-filter: blur(3px);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000; padding: 24px;
}
.modal {
  background: #f8fafc;
  border-radius: 20px;
  box-shadow: 0 24px 60px rgba(0,0,0,.2);
  width: 100%; max-width: 680px;
  max-height: 90vh;
  display: flex; flex-direction: column;
  overflow: hidden;
}
.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 20px;
  background: #fff;
  border-bottom: 1px solid #e2e8f0;
  gap: 12px;
  flex-shrink: 0;
}
.modal-title-group { display: flex; align-items: center; gap: 10px; }
.modal-title { font-size: 16px; font-weight: 700; color: #0f172a; margin: 0; }
.modal-header-actions { display: flex; align-items: center; gap: 4px; margin-left: auto; }
.modal-act-btn {
  display: inline-flex; align-items: center; justify-content: center;
  width: 34px; height: 34px; border: none; background: none;
  cursor: pointer; border-radius: 8px; color: #64748b;
  transition: color .12s, background .12s;
}
.modal-act-btn:hover { color: #0f172a; background: #f1f5f9; }
.modal-close {
  display: inline-flex; align-items: center; justify-content: center;
  width: 34px; height: 34px; border: none; background: none;
  cursor: pointer; border-radius: 8px; font-size: 16px; color: #94a3b8;
  transition: color .12s, background .12s;
}
.modal-close:hover { color: #0f172a; background: #f1f5f9; }
.modal-body { overflow-y: auto; padding: 24px; }

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
  .modal-overlay { padding: 12px; }
}
</style>
