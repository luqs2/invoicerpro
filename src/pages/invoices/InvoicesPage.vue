<template>
  <div class="page">
    <!-- Page header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">
          Invoices
        </h1>
        <p class="page-sub">
          {{ store.invoices.length }} total invoice{{ store.invoices.length !== 1 ? 's' : '' }}
        </p>
      </div>
      <div class="header-actions">
        <router-link
          to="/app/invoices/new"
          class="btn-primary"
        >
          <Plus :size="15" />
          New Invoice
        </router-link>
      </div>
    </div>

    <!-- Toolbar: search + filters -->
    <div class="toolbar">
      <div class="search-wrap">
        <Search
          :size="15"
          class="search-icon"
        />
        <input
          v-model="search"
          class="search-input"
          placeholder="Search invoice # or client…"
        >
      </div>
      <button
        class="filter-toggle"
        :class="{ active: hasActiveFilters }"
        @click="showFilters = !showFilters"
      >
        <SlidersHorizontal :size="14" />
        Filters
        <span
          v-if="hasActiveFilters"
          class="filter-active-dot"
        />
      </button>
      <div class="filter-tabs">
        <button
          v-for="t in tabs"
          :key="t.value"
          class="filter-tab"
          :class="{ active: filter === t.value }"
          @click="filter = t.value"
        >
          {{ t.label }}
          <span
            class="tab-count"
            :class="{ 'tab-count-active': filter === t.value }"
          >{{ t.count }}</span>
        </button>
      </div>
    </div>

    <!-- Advanced filters -->
    <div
      v-if="showFilters"
      class="advanced-filters"
    >
      <div class="af-row">
        <div class="af-field">
          <label>From Date</label>
          <input
            v-model="dateFrom"
            type="date"
            class="af-input"
          >
        </div>
        <div class="af-field">
          <label>To Date</label>
          <input
            v-model="dateTo"
            type="date"
            class="af-input"
          >
        </div>
        <div class="af-field">
          <label>Min Amount</label>
          <input
            v-model.number="minAmount"
            type="number"
            min="0"
            step="0.01"
            placeholder="0"
            class="af-input"
          >
        </div>
        <div class="af-field">
          <label>Max Amount</label>
          <input
            v-model.number="maxAmount"
            type="number"
            min="0"
            step="0.01"
            placeholder="∞"
            class="af-input"
          >
        </div>
        <button
          v-if="hasActiveFilters"
          class="af-clear"
          @click="clearFilters"
        >
          Clear
        </button>
      </div>
    </div>

    <!-- Table skeleton -->
    <div
      v-if="!fetched"
      class="section-card"
    >
      <table class="data-table">
        <thead>
          <tr>
            <th style="width:40px; padding-left:16px;" />
            <th>Invoice #</th>
            <th>Client</th>
            <th>Issue Date</th>
            <th>Due Date</th>
            <th>Amount</th>
            <th>Status</th>
            <th style="width:120px; text-align:right; padding-right:20px;">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="i in 5"
            :key="i"
            class="table-row"
          >
            <td style="padding-left:16px;">
              <Skeleton
                variant="text"
                width="16px"
                height="16px"
              />
            </td>
            <td>
              <Skeleton
                variant="text"
                width="100px"
              />
            </td>
            <td>
              <Skeleton
                variant="text"
                width="130px"
              />
            </td>
            <td>
              <Skeleton
                variant="text"
                width="100px"
              />
            </td>
            <td>
              <Skeleton
                variant="text"
                width="100px"
              />
            </td>
            <td>
              <Skeleton
                variant="text"
                width="80px"
              />
            </td>
            <td>
              <Skeleton
                variant="rect"
                width="60px"
                height="22px"
              />
            </td>
            <td style="text-align:right; padding-right:20px;">
              <Skeleton
                variant="text"
                width="60px"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <template v-else>
      <!-- Bulk action bar -->
      <div
        v-if="selectedIds.size > 0"
        class="bulk-bar"
      >
        <div class="bulk-left">
          <CheckSquare :size="16" />
          <span>{{ selectedIds.size }} selected</span>
        </div>
        <div class="bulk-actions">
          <button
            class="bulk-btn"
            @click="bulkExport"
          >
            <Download :size="14" />
            Export PDFs
          </button>
          <button
            class="bulk-btn bulk-btn-danger"
            @click="bulkDelete"
          >
            <Trash2 :size="14" />
            Delete
          </button>
        </div>
      </div>

      <!-- Table -->
      <div
        v-if="filtered.length"
        class="section-card"
      >
        <table
          class="data-table"
          aria-live="polite"
        >
          <caption class="sr-only">
            Invoices
          </caption>
          <thead>
            <tr>
              <th
                scope="col"
                style="width:40px; padding-left:16px;"
              >
                <input
                  v-model="selectAll"
                  type="checkbox"
                  class="select-cb"
                  aria-label="Select all"
                >
              </th>
              <th scope="col">
                Invoice #
              </th>
              <th scope="col">
                Client
              </th>
              <th scope="col">
                Issue Date
              </th>
              <th scope="col">
                Due Date
              </th>
              <th scope="col">
                Amount
              </th>
              <th scope="col">
                Status
              </th>
              <th
                scope="col"
                style="width:120px; text-align:right; padding-right:20px;"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="inv in paginated"
              :key="inv.id"
              class="table-row"
            >
              <td style="padding-left:16px;">
                <input
                  type="checkbox"
                  :checked="selectedIds.has(inv.id)"
                  class="select-cb"
                  :aria-label="`Select ${inv.invoice_number}`"
                  @change="toggleSelect(inv.id)"
                >
              </td>
              <td class="td-mono">
                {{ inv.invoice_number }}
              </td>
              <td class="td-client">
                {{ inv.client?.name ?? '—' }}
              </td>
              <td class="td-muted">
                {{ formatDate(inv.issue_date) }}
              </td>
              <td class="td-muted">
                {{ formatDate(inv.due_date) }}
              </td>
              <td class="td-mono td-bold">
                {{ formatCurrency(inv.total, inv.currency) }}
              </td>
              <td>
                <span
                  class="status-badge"
                  :class="`status-${inv.status}`"
                >{{ inv.status }}</span>
              </td>
              <td class="td-actions">
                <button
                  class="act-btn act-view"
                  title="View"
                  :aria-label="`View ${inv.invoice_number}`"
                  @click="viewInvoice(inv)"
                >
                  <Eye :size="14" />
                </button>
                <button
                  class="act-btn act-edit"
                  title="Edit"
                  :aria-label="`Edit ${inv.invoice_number}`"
                  @click="editInvoice(inv)"
                >
                  <Pencil :size="14" />
                </button>
                <button
                  class="act-btn act-del"
                  title="Delete"
                  :aria-label="`Delete ${inv.invoice_number}`"
                  @click="deleteInvoice(inv)"
                >
                  <Trash2 :size="14" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <Pagination
          :current-page="currentPage"
          :total="filtered.length"
          :page-size="pageSize"
          @update:current-page="currentPage = $event"
          @update:page-size="pageSize = $event; currentPage = 1"
        />
      </div>

      <!-- Empty -->
      <div
        v-else
        class="empty-state"
      >
        <FileText
          :size="52"
          class="empty-icon"
        />
        <p class="empty-title">
          {{ search || filter !== 'all' ? 'No matching invoices' : 'No invoices yet' }}
        </p>
        <p class="empty-sub">
          {{ search || filter !== 'all' ? 'Try adjusting your search or filter.' : 'Create your first invoice to get started.' }}
        </p>
        <router-link
          v-if="!search && filter === 'all'"
          to="/app/invoices/new"
          class="btn-primary"
          style="margin-top:8px;"
        >
          New Invoice
        </router-link>
      </div>
    </template>

    <!-- View modal -->
    <div
      v-if="viewing"
      class="modal-overlay"
      @click.self="viewing = null"
    >
      <div class="modal">
        <div class="modal-header">
          <div class="modal-title-group">
            <span
              class="status-badge"
              :class="`status-${viewing.status}`"
            >{{ viewing.status }}</span>
            <h2 class="modal-title">
              {{ viewing.invoice_number }}
            </h2>
          </div>
          <div class="modal-header-actions">
            <button
              class="modal-act-btn"
              title="Export PDF"
              aria-label="Export PDF"
              @click="exportInvoicePdf(viewing)"
            >
              <Download :size="15" />
            </button>
            <button
              class="modal-act-btn"
              title="Edit"
              aria-label="Edit invoice"
              @click="editInvoice(viewing); viewing = null"
            >
              <Pencil :size="15" />
            </button>
            <button
              class="modal-close"
              aria-label="Close preview"
              @click="viewing = null"
            >
              ✕
            </button>
          </div>
        </div>
        <div class="modal-body">
          <InvoicePreview
            id="invoice-preview-modal"
            :invoice="viewing"
            :template="templateStore.active"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, defineAsyncComponent, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, Search, FileText, Eye, Pencil, Trash2, Download, SlidersHorizontal, CheckSquare } from '@lucide/vue'
import { useInvoiceStore }  from '@/stores/invoices'
import { useTemplateStore } from '@/stores/templates'
import { invoiceService }   from '@/services/invoices'
import { useFormatters }    from '@/composables/useFormatters'
import { useToast }         from '@/composables/useToast'
import { usePdf }           from '@/composables/usePdf'
import { useConfirm }       from '@/composables/useConfirm'
import { useEscapeKey }     from '@/composables/useFocusTrap'
import { useMinDelay }      from '@/composables/useMinDelay'
import Skeleton from '@/components/ui/Skeleton.vue'
import Pagination from '@/components/ui/Pagination.vue'
import type { Invoice } from '@/types'

const InvoicePreview = defineAsyncComponent(() => import('@/components/invoice/InvoicePreview.vue'))

const router        = useRouter()
const store         = useInvoiceStore()
const templateStore = useTemplateStore()
const { formatCurrency, formatDate } = useFormatters()
const { showToast } = useToast()
const { exportToPdf } = usePdf()
const { confirm } = useConfirm()
const { wrap } = useMinDelay()

const fetched = ref(false)
const search  = ref('')
const filter  = ref('all')
const viewing = ref<Invoice | null>(null)
const showFilters = ref(false)
const dateFrom = ref('')
const dateTo = ref('')
const minAmount = ref<number | null>(null)
const maxAmount = ref<number | null>(null)
const currentPage = ref(1)
const pageSize = ref(10)

useEscapeKey(() => {
  if (viewing.value) viewing.value = null
})

const selectedIds = ref<Set<string>>(new Set())
const selectAll = computed({
  get: () => paginated.value.length > 0 && paginated.value.every(i => selectedIds.value.has(i.id)),
  set: (val: boolean) => {
    if (val) {
      selectedIds.value = new Set(paginated.value.map(i => i.id))
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

watch([search, filter, dateFrom, dateTo, minAmount, maxAmount], () => {
  currentPage.value = 1
})

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

onMounted(async () => {
  await wrap(Promise.all([
    store.fetchAll(),
    templateStore.fetchAll(),
  ]))
  fetched.value = true
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

const paginated = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filtered.value.slice(start, start + pageSize.value)
})

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
/* No page-specific overrides needed — all shared styles from utilities.css */
</style>
