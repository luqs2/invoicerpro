<template>
  <div class="page">

    <div class="page-header">
      <div>
        <h1 class="page-title">Receipts</h1>
        <p class="page-sub">{{ receipts.length }} receipt{{ receipts.length !== 1 ? 's' : '' }}</p>
      </div>
      <div class="header-actions">
        <router-link to="/app/receipts/new" class="btn-primary">
          <Plus :size="15" />
          New Receipt
        </router-link>
      </div>
    </div>

    <!-- Search bar -->
    <div class="toolbar">
      <div class="search-wrap">
        <Search :size="15" class="search-icon" />
        <input class="search-input" v-model="search" placeholder="Search receipt # or client…" />
      </div>
      <button class="filter-toggle" @click="showFilters = !showFilters" :class="{ active: hasActiveFilters }">
        <SlidersHorizontal :size="14" />
        Filters
        <span v-if="hasActiveFilters" class="filter-active-dot" />
      </button>
      <div class="filter-tabs">
        <button
          v-for="t in methodTabs" :key="t.value"
          class="filter-tab" :class="{ active: methodFilter === t.value }"
          @click="methodFilter = t.value"
        >
          {{ t.label }}
          <span class="tab-count" :class="{ 'tab-count-active': methodFilter === t.value }">{{ t.count }}</span>
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
    <div class="section-card" v-if="loading">
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
        <button class="bulk-btn bulk-btn-danger" @click="bulkDelete">
          <Trash2 :size="14" />
          Delete
        </button>
      </div>
    </div>

    <div class="section-card" v-if="filtered.length">
      <table class="data-table">
          <caption class="sr-only">Receipts</caption>
          <thead>
            <tr>
              <th scope="col" style="width:40px; padding-left:16px;">
                <input type="checkbox" v-model="selectAll" class="select-cb" aria-label="Select all" />
              </th>
              <th scope="col">Receipt #</th>
              <th scope="col">Client</th>
              <th scope="col">Payment Date</th>
              <th scope="col">Method</th>
              <th scope="col">Amount</th>
              <th scope="col" style="width:120px; text-align:right; padding-right:20px;">Actions</th>
            </tr>
          </thead>
        <tbody>
          <tr v-for="r in filtered" :key="r.id" class="table-row">
            <td style="padding-left:16px;">
              <input type="checkbox" :checked="selectedIds.has(r.id)" @change="toggleSelect(r.id)" class="select-cb" :aria-label="`Select ${r.receipt_number}`" />
            </td>
            <td class="td-mono">{{ r.receipt_number }}</td>
            <td class="td-client">{{ r.client?.name ?? '—' }}</td>
            <td class="td-muted">{{ formatDate(r.payment_date) }}</td>
            <td>
              <UiBadge :variant="methodVariant(r.payment_method)">{{ methodLabel(r.payment_method) }}</UiBadge>
            </td>
            <td class="td-mono td-bold">{{ formatCurrency(r.amount, r.currency) }}</td>
            <td class="td-actions">
              <button class="act-btn act-view"  @click="viewReceipt(r)"   title="View" :aria-label="`View ${r.receipt_number}`">
                <Eye :size="14" />
              </button>
              <button class="act-btn act-edit"  @click="editReceipt(r)"   title="Edit" :aria-label="`Edit ${r.receipt_number}`">
                <Pencil :size="14" />
              </button>
              <button class="act-btn act-del"   @click="deleteReceipt(r)" title="Delete" :aria-label="`Delete ${r.receipt_number}`">
                <Trash2 :size="14" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="empty-state" v-else>
      <FileText :size="52" class="empty-icon" />
      <p class="empty-title">{{ search || methodFilter !== 'all' || hasActiveFilters ? 'No matching receipts' : 'No receipts yet' }}</p>
      <p class="empty-sub">{{ search || methodFilter !== 'all' || hasActiveFilters ? 'Try adjusting your search or filter.' : 'Create a receipt to record a payment.' }}</p>
      <router-link v-if="!search && methodFilter === 'all' && !hasActiveFilters" to="/app/receipts/new" class="btn-primary" style="margin-top:8px;">
        New Receipt
      </router-link>
    </div>

    <!-- View modal -->
    <div class="modal-overlay" v-if="viewing" @click.self="viewing = null">
      <div class="modal">
        <div class="modal-header">
          <div class="modal-title-group">
            <UiBadge :variant="methodVariant(viewing.payment_method)">{{ methodLabel(viewing.payment_method) }}</UiBadge>
            <h2 class="modal-title">{{ viewing.receipt_number }}</h2>
          </div>
          <div class="modal-header-actions">
            <button class="modal-act-btn" @click="exportReceiptPdf(viewing)" title="Export PDF" aria-label="Export PDF">
              <Download :size="15" />
            </button>
            <button class="modal-act-btn" @click="editReceipt(viewing); viewing = null" title="Edit" aria-label="Edit receipt">
              <Pencil :size="15" />
            </button>
            <button class="modal-close" @click="viewing = null" aria-label="Close preview">
              ✕
            </button>
          </div>
        </div>
        <div class="modal-body">
          <ReceiptPreview id="receipt-preview-modal" :receipt="viewing" :template="templateStore.active" />
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, defineAsyncComponent } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, FileText, Search, Eye, Pencil, Trash2, Download, CheckSquare, SlidersHorizontal } from '@lucide/vue'
import { receiptService }  from '@/services/receipts'
import { useAuthStore }    from '@/stores/auth'
import { useTemplateStore } from '@/stores/templates'
import { useFormatters }   from '@/composables/useFormatters'
import { useToast }        from '@/composables/useToast'
import { usePdf }          from '@/composables/usePdf'
import { useConfirm }      from '@/composables/useConfirm'
import { useEscapeKey }    from '@/composables/useFocusTrap'
import UiBadge       from '@/components/ui/Badge.vue'
import Skeleton from '@/components/ui/Skeleton.vue'

const ReceiptPreview = defineAsyncComponent(() => import('@/components/receipt/ReceiptPreview.vue'))

const router        = useRouter()
const auth          = useAuthStore()
const templateStore = useTemplateStore()
const { formatCurrency, formatDate } = useFormatters()
const { showToast } = useToast()
const { exportToPdf } = usePdf()
const { confirm } = useConfirm()

const receipts = ref<any[]>([])
const search   = ref('')
const viewing  = ref<any | null>(null)
const loading  = ref(true)
const showFilters = ref(false)
const methodFilter = ref('all')
const dateFrom = ref('')
const dateTo = ref('')
const minAmount = ref<number | null>(null)
const maxAmount = ref<number | null>(null)

useEscapeKey(() => {
  if (viewing.value) viewing.value = null
})

const selectedIds = ref<Set<string>>(new Set())
const selectAll = computed({
  get: () => filtered.value.length > 0 && filtered.value.every(r => selectedIds.value.has(r.id)),
  set: (val: boolean) => {
    if (val) {
      selectedIds.value = new Set(filtered.value.map(r => r.id))
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

async function bulkDelete() {
  const count = selectedIds.value.size
  const ok = await confirm({
    title: `Delete ${count} receipt${count > 1 ? 's' : ''}`,
    message: `This will permanently delete ${count} receipt${count > 1 ? 's' : ''}. This cannot be undone.`,
    confirmText: 'Delete All',
    variant: 'danger',
  })
  if (!ok) return

  for (const id of selectedIds.value) {
    await receiptService.delete(id)
    receipts.value = receipts.value.filter(r => r.id !== id)
  }
  selectedIds.value = new Set()
  showToast(`${count} receipt${count > 1 ? 's' : ''} deleted`)
}

const filtered = computed(() =>
  receipts.value
    .filter(r => methodFilter.value === 'all' || r.payment_method === methodFilter.value)
    .filter(r =>
      r.receipt_number.toLowerCase().includes(search.value.toLowerCase()) ||
      (r.client?.name ?? '').toLowerCase().includes(search.value.toLowerCase())
    )
    .filter(r => {
      if (dateFrom.value && r.payment_date < dateFrom.value) return false
      if (dateTo.value && r.payment_date > dateTo.value) return false
      if (minAmount.value !== null && r.amount < minAmount.value) return false
      if (maxAmount.value !== null && r.amount > maxAmount.value) return false
      return true
    })
)

const methodTabs = computed(() => [
  { label: 'All',      value: 'all',           count: receipts.value.length },
  { label: 'Transfer',  value: 'bank_transfer', count: receipts.value.filter(r => r.payment_method === 'bank_transfer').length },
  { label: 'Cash',     value: 'cash',          count: receipts.value.filter(r => r.payment_method === 'cash').length },
  { label: 'Online',   value: 'online',        count: receipts.value.filter(r => r.payment_method === 'online').length },
  { label: 'Card',     value: 'card',          count: receipts.value.filter(r => r.payment_method === 'card').length },
])

const hasActiveFilters = computed(() =>
  !!dateFrom.value || !!dateTo.value || minAmount.value !== null || maxAmount.value !== null
)

function clearFilters() {
  dateFrom.value = ''
  dateTo.value = ''
  minAmount.value = null
  maxAmount.value = null
}

onMounted(async () => {
  if (!auth.user) return
  const [{ data }] = await Promise.all([
    receiptService.getAll(auth.user.id),
    templateStore.fetchAll(),
  ])
  receipts.value = data ?? []
  loading.value = false
})

function viewReceipt(r: any) {
  viewing.value = r
}

function editReceipt(r: any) {
  router.push(`/app/receipts/${r.id}`)
}

async function deleteReceipt(r: any) {
  const ok = await confirm({
    title: 'Delete receipt',
    message: `Delete receipt ${r.receipt_number}? This cannot be undone.`,
    confirmText: 'Delete',
    variant: 'danger',
  })
  if (!ok) return
  const { error } = await receiptService.delete(r.id)
  if (error) { showToast('Failed to delete receipt', 'danger'); return }
  receipts.value = receipts.value.filter(x => x.id !== r.id)
  showToast('Receipt deleted')
}

async function exportReceiptPdf(r: any) {
  await exportToPdf('receipt-preview-modal', r.receipt_number ?? 'receipt')
  showToast('PDF exported!')
}

function methodLabel(m: string) {
  return ({ bank_transfer: 'Bank Transfer', cash: 'Cash', online: 'Online', card: 'Card', other: 'Other' } as any)[m] ?? m
}

function methodVariant(m: string): 'success' | 'default' | 'sent' | 'warning' {
  return ({ bank_transfer: 'success', online: 'sent', cash: 'default', card: 'warning' } as any)[m] ?? 'default'
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

.page-header { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; }
.page-title  { font-size: 26px; font-weight: 800; color: #0f172a; margin: 0 0 2px; letter-spacing: -0.5px; }
.page-sub    { font-size: 13px; color: #94a3b8; margin: 0; font-weight: 500; }
.header-actions { display: flex; align-items: center; gap: 8px; }

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
.toolbar { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.search-wrap { position: relative; min-width: 220px; max-width: 360px; flex: 1; }
.search-icon { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); color: #94a3b8; pointer-events: none; }
.search-input {
  width: 100%; height: 38px; padding: 0 14px 0 36px;
  border: 1.5px solid #e2e8f0; border-radius: 9px;
  font-size: 14px; color: #0f172a; background: #fff;
  outline: none; font-family: inherit; transition: border-color .15s, box-shadow .15s;
}
.search-input:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,.1); }
.search-input::placeholder { color: #94a3b8; }

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
.bulk-actions { display: flex; gap: 8px; }
.bulk-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 6px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px;
  background: #fff; font-size: 13px; font-weight: 600; color: #374151;
  cursor: pointer; font-family: inherit; transition: all .12s;
}
.bulk-btn:hover { background: #f8fafc; border-color: #c7d2fe; }
.bulk-btn-danger { border-color: #fecaca; color: #991b1b; }
.bulk-btn-danger:hover { background: #fee2e2; border-color: #fca5a5; }
.select-cb { width: 16px; height: 16px; accent-color: #6366f1; cursor: pointer; }

/* Empty */
.empty-state { display: flex; flex-direction: column; align-items: center; padding: 80px 20px; gap: 8px; background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; }
.empty-icon  { color: #cbd5e1; margin-bottom: 4px; }
.empty-title { font-size: 16px; font-weight: 700; color: #374151; margin: 0; }
.empty-sub   { font-size: 14px; color: #94a3b8; margin: 0; }

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

@media (max-width: 768px) {
  .page { padding: 20px 16px; }
  .modal-overlay { padding: 12px; }
}
</style>
