<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="page-title">
          Receipts
        </h1>
        <p class="page-sub">
          {{ receipts.length }} receipt{{ receipts.length !== 1 ? 's' : '' }}
        </p>
      </div>
      <div class="header-actions">
        <router-link
          to="/app/receipts/new"
          class="btn-primary"
        >
          <Plus :size="15" />
          New Receipt
        </router-link>
      </div>
    </div>

    <!-- Search bar -->
    <div class="toolbar">
      <div class="search-wrap">
        <Search
          :size="15"
          class="search-icon"
        />
        <input
          v-model="search"
          class="search-input"
          placeholder="Search receipt # or client…"
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
          v-for="t in methodTabs"
          :key="t.value"
          class="filter-tab"
          :class="{ active: methodFilter === t.value }"
          @click="methodFilter = t.value"
        >
          {{ t.label }}
          <span
            class="tab-count"
            :class="{ 'tab-count-active': methodFilter === t.value }"
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
            <th>Receipt #</th>
            <th>Client</th>
            <th>Payment Date</th>
            <th>Method</th>
            <th>Amount</th>
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
                width="90px"
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
                variant="rect"
                width="80px"
                height="22px"
              />
            </td>
            <td>
              <Skeleton
                variant="text"
                width="70px"
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
            class="bulk-btn bulk-btn-danger"
            @click="bulkDelete"
          >
            <Trash2 :size="14" />
            Delete
          </button>
        </div>
      </div>

      <div
        v-if="filtered.length"
        class="section-card animate-in"
      >
        <table class="data-table">
          <caption class="sr-only">
            Receipts
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
                Receipt #
              </th>
              <th scope="col">
                Client
              </th>
              <th scope="col">
                Payment Date
              </th>
              <th scope="col">
                Method
              </th>
              <th scope="col">
                Amount
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
              v-for="r in paginated"
              :key="r.id"
              class="table-row"
            >
              <td style="padding-left:16px;">
                <input
                  type="checkbox"
                  :checked="selectedIds.has(r.id)"
                  class="select-cb"
                  :aria-label="`Select ${r.receipt_number}`"
                  @change="toggleSelect(r.id)"
                >
              </td>
              <td class="td-mono">
                {{ r.receipt_number }}
              </td>
              <td class="td-client">
                {{ r.client?.name ?? '—' }}
              </td>
              <td class="td-muted">
                {{ formatDate(r.payment_date) }}
              </td>
              <td>
                <UiBadge :variant="methodVariant(r.payment_method)">
                  {{ methodLabel(r.payment_method) }}
                </UiBadge>
              </td>
              <td class="td-mono td-bold">
                {{ formatCurrency(r.amount, r.currency) }}
              </td>
              <td class="td-actions">
                <button
                  class="act-btn act-view"
                  title="View"
                  :aria-label="`View ${r.receipt_number}`"
                  @click="viewReceipt(r)"
                >
                  <Eye :size="14" />
                </button>
                <button
                  class="act-btn act-edit"
                  title="Edit"
                  :aria-label="`Edit ${r.receipt_number}`"
                  @click="editReceipt(r)"
                >
                  <Pencil :size="14" />
                </button>
                <button
                  class="act-btn act-del"
                  title="Delete"
                  :aria-label="`Delete ${r.receipt_number}`"
                  @click="deleteReceipt(r)"
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

      <div
        v-else
        class="empty-state"
      >
        <FileText
          :size="52"
          class="empty-icon"
        />
        <p class="empty-title">
          {{ search || methodFilter !== 'all' || hasActiveFilters ? 'No matching receipts' : 'No receipts yet' }}
        </p>
        <p class="empty-sub">
          {{ search || methodFilter !== 'all' || hasActiveFilters ? 'Try adjusting your search or filter.' : 'Create a receipt to record a payment.' }}
        </p>
        <router-link
          v-if="!search && methodFilter === 'all' && !hasActiveFilters"
          to="/app/receipts/new"
          class="btn-primary"
          style="margin-top:8px;"
        >
          New Receipt
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
            <UiBadge :variant="methodVariant(viewing.payment_method)">
              {{ methodLabel(viewing.payment_method) }}
            </UiBadge>
            <h2 class="modal-title">
              {{ viewing.receipt_number }}
            </h2>
          </div>
          <div class="modal-header-actions">
            <button
              class="modal-act-btn"
              title="Export PDF"
              aria-label="Export PDF"
              @click="exportReceiptPdf(viewing)"
            >
              <Download :size="15" />
            </button>
            <button
              class="modal-act-btn"
              title="Edit"
              aria-label="Edit receipt"
              @click="editReceipt(viewing); viewing = null"
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
          <ReceiptPreview
            id="receipt-preview-modal"
            :receipt="viewing"
            :template="templateStore.active"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, defineAsyncComponent, watch } from 'vue'
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
import { useMinDelay }     from '@/composables/useMinDelay'
import UiBadge       from '@/components/ui/Badge.vue'
import Skeleton from '@/components/ui/Skeleton.vue'
import Pagination from '@/components/ui/Pagination.vue'

const ReceiptPreview = defineAsyncComponent(() => import('@/components/receipt/ReceiptPreview.vue'))

const router        = useRouter()
const auth          = useAuthStore()
const templateStore = useTemplateStore()
const { formatCurrency, formatDate } = useFormatters()
const { showToast } = useToast()
const { exportToPdf } = usePdf()
const { confirm } = useConfirm()
const { wrap } = useMinDelay()

const receipts = ref<any[]>([])
const fetched  = ref(false)
const search   = ref('')
const viewing  = ref<any | null>(null)
const showFilters = ref(false)
const methodFilter = ref('all')
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
  get: () => paginated.value.length > 0 && paginated.value.every(r => selectedIds.value.has(r.id)),
  set: (val: boolean) => {
    if (val) {
      selectedIds.value = new Set(paginated.value.map(r => r.id))
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

const paginated = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filtered.value.slice(start, start + pageSize.value)
})

watch([search, methodFilter, dateFrom, dateTo, minAmount, maxAmount], () => {
  currentPage.value = 1
})

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
  if (!auth.user) { fetched.value = true; return }
  const [{ data }] = await wrap(Promise.all([
    receiptService.getAll(auth.user.id),
    templateStore.fetchAll(),
  ]))
  receipts.value = data ?? []
  fetched.value = true
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
/* No page-specific overrides needed — all shared styles from utilities.css */
</style>
