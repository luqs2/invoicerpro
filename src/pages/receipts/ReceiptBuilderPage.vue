<template>
  <div class="page">

    <!-- Header -->
    <div class="page-header">
      <div class="header-left">
        <router-link to="/app/receipts" class="back-link">
          <ArrowLeft :size="16" />
          <span class="back-text">Receipts</span>
        </router-link>
        <h1 class="page-title">{{ isEdit ? 'Edit Receipt' : 'New Receipt' }}</h1>
      </div>
      <div class="header-actions desktop-only">
        <UiButton variant="outline" @click="exportPdf" :disabled="saving">
          <Download :size="14" />
          Export PDF
        </UiButton>
        <UiButton @click="save" :loading="saving">Save Receipt</UiButton>
      </div>
    </div>

    <!-- Import from invoice banner -->
    <div class="import-banner" v-if="!isEdit && !importedFromInvoice">
      <div class="import-banner-text">
        <FileText :size="16" />
        <span>Have an existing invoice? Pre-fill this receipt from it.</span>
      </div>
      <UiSelect
        v-model="selectedImportInvoiceId"
        :options="invoiceOptions"
        placeholder="Select invoice to import…"
        class="import-select"
      />
      <UiButton variant="outline" size="sm" @click="importFromInvoice" :disabled="!selectedImportInvoiceId">
        Import
      </UiButton>
    </div>

    <!-- Imported badge -->
    <div class="imported-badge" v-if="importedFromInvoice">
      <CheckCircle :size="14" />
      Pre-filled from invoice <strong>{{ form.invoice_number }}</strong>
      <button class="clear-import" @click="clearImport">✕</button>
    </div>

    <!-- Two-column layout -->
    <div class="builder-layout">

      <!-- Left: form + preview tabs -->
      <div class="builder-form">

        <UiTabs v-model="tab" :tabs="[
          { value: 'form',    label: 'Details' },
          { value: 'preview', label: 'Preview' },
        ]" />

        <!-- Details tab -->
        <template v-if="tab === 'form'">

          <!-- Receipt details -->
          <div class="form-card">
            <div class="card-header">
              <h2 class="card-title">Receipt Details</h2>
            </div>
            <div class="card-body">
              <div class="field-row">
                <div class="field">
                  <label>Client</label>
                  <UiSelect
                    v-model="form.client_id"
                    :options="clientOptions"
                    placeholder="Select client…"
                  />
                </div>
                <div class="field">
                  <label>Currency</label>
                  <UiSelect
                    v-model="form.currency"
                    :options="currencyOptions"
                    placeholder="Select currency"
                  />
                </div>
              </div>

              <div class="field-row">
                <div class="field">
                  <label>Amount Paid</label>
                  <UiInput v-model="form.amount" type="number" placeholder="0.00" min="0" step="0.01" />
                </div>
                <div class="field">
                  <label>Payment Date</label>
                  <UiInput v-model="form.payment_date" type="date" />
                </div>
              </div>

              <div class="field">
                <label>Payment Method</label>
                <UiSelect
                  v-model="form.payment_method"
                  :options="paymentMethodOptions"
                  placeholder="Select method…"
                />
              </div>

              <div class="field" v-if="form.invoice_number">
                <label>Invoice Reference</label>
                <UiInput v-model="form.invoice_number" placeholder="INV-0001" />
              </div>
            </div>
          </div>

          <!-- Line items (from invoice, editable) -->
          <div class="form-card" v-if="form.line_items && form.line_items.length">
            <div class="card-header">
              <h2 class="card-title">Line Items</h2>
              <span class="card-subtitle">Imported from invoice</span>
            </div>
            <div class="card-body">
              <div class="line-items-table">
                <div class="li-header">
                  <span class="li-col-desc">Description</span>
                  <span class="li-col-qty">Qty</span>
                  <span class="li-col-rate">Rate</span>
                  <span class="li-col-amt">Amount</span>
                  <span class="li-col-del"></span>
                </div>
                <div v-for="(item, idx) in form.line_items" :key="item.id" class="li-row">
                  <input
                    class="li-input"
                    :value="item.description"
                    placeholder="Description…"
                    @input="debouncedUpdateItem(idx, { description: ($event.target as HTMLInputElement).value })"
                  />
                  <input
                    class="li-input li-input-num"
                    type="number"
                    :value="item.quantity"
                    min="0"
                    @input="debouncedUpdateItem(idx, { quantity: Number(($event.target as HTMLInputElement).value) })"
                  />
                  <input
                    class="li-input li-input-num"
                    type="number"
                    :value="item.unit_price"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    @input="debouncedUpdateItem(idx, { unit_price: Number(($event.target as HTMLInputElement).value) })"
                  />
                  <span class="li-amount">{{ formatCurrency(item.amount, form.currency) }}</span>
                  <button class="li-del" @click="removeItem(idx)" title="Remove" :aria-label="`Remove line item ${idx + 1}`">
                    <Trash2 :size="14" />
                  </button>
                </div>
              </div>

              <!-- Totals -->
              <div class="totals">
                <div class="t-row">
                  <span class="t-label">Subtotal</span>
                  <span class="t-value">{{ formatCurrency(form.subtotal ?? 0, form.currency) }}</span>
                </div>
                <div class="t-row" v-if="form.tax_amount">
                  <span class="t-label">Tax ({{ form.tax_rate }}%)</span>
                  <span class="t-value">{{ formatCurrency(form.tax_amount ?? 0, form.currency) }}</span>
                </div>
                <div class="t-row t-total">
                  <span class="t-label">Total</span>
                  <span class="t-value t-total-value">{{ formatCurrency(form.amount ?? 0, form.currency) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Notes -->
          <div class="form-card">
            <div class="card-header">
              <h2 class="card-title">Notes</h2>
            </div>
            <div class="card-body">
              <UiTextarea
                v-model="form.notes"
                placeholder="Thank you for your payment…"
                :rows="3"
              />
            </div>
          </div>

        </template>

        <!-- Preview tab -->
        <div v-if="tab === 'preview'" class="preview-card">
          <ReceiptPreview
            id="receipt-preview"
            :receipt="previewData"
            :template="templateStore.active"
          />
        </div>

      </div>

      <!-- Right: summary sidebar -->
      <div class="builder-sidebar">
        <div class="summary-card">
          <div class="card-header">
            <h2 class="card-title">Summary</h2>
          </div>
          <div class="summary-body">
            <div class="s-row">
              <span class="s-label">Client</span>
              <span class="s-value">{{ selectedClientName }}</span>
            </div>
            <div class="s-row">
              <span class="s-label">Method</span>
              <span class="s-value">{{ selectedMethodLabel }}</span>
            </div>
            <div class="s-row">
              <span class="s-label">Date</span>
              <span class="s-value">{{ form.payment_date || '—' }}</span>
            </div>
            <div class="s-row" v-if="form.invoice_number">
              <span class="s-label">Invoice</span>
              <span class="s-value mono">{{ form.invoice_number }}</span>
            </div>
            <div class="s-row" v-if="form.invoice_id">
              <span class="s-label">Invoice Status</span>
              <span class="inv-status-badge" :class="`inv-status-${linkedInvoiceStatus}`">
                {{ linkedInvoiceStatus }}
              </span>
            </div>
            <div class="s-divider" />
            <div class="s-row s-total">
              <span class="s-label">Amount Paid</span>
              <span class="s-value mono">{{ formatCurrency(Number(form.amount), form.currency) }}</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch, nextTick, defineAsyncComponent } from 'vue'
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router'
import { ArrowLeft, Download, FileText, Trash2, CheckCircle } from '@lucide/vue'
import confetti from 'canvas-confetti'
import { useClientStore }   from '@/stores/clients'
import { useInvoiceStore }  from '@/stores/invoices'
import { useTemplateStore } from '@/stores/templates'
import { receiptService }   from '@/services/receipts'
import { invoiceService }   from '@/services/invoices'
import { useAuthStore }     from '@/stores/auth'
import { useFormatters }    from '@/composables/useFormatters'
import { usePdf }           from '@/composables/usePdf'
import { useToast }         from '@/composables/useToast'
import { useConfirm }       from '@/composables/useConfirm'
import { debounce }         from '@/utils/debounce'
import UiButton   from '@/components/ui/Button.vue'

const ReceiptPreview = defineAsyncComponent(() => import('@/components/receipt/ReceiptPreview.vue'))
import UiTabs     from '@/components/ui/Tabs.vue'
import UiSelect   from '@/components/ui/Select.vue'
import UiInput    from '@/components/ui/Input.vue'
import UiTextarea from '@/components/ui/Textarea.vue'
import type { LineItem, ReceiptPreviewData } from '@/types'

const route         = useRoute()
const router        = useRouter()
const clientStore   = useClientStore()
const invoiceStore  = useInvoiceStore()
const templateStore = useTemplateStore()
const auth          = useAuthStore()
const { formatCurrency } = useFormatters()
const { exportToPdf }    = usePdf()
const { showToast }      = useToast()
const { confirm }        = useConfirm()

const debouncedUpdateItem = debounce((idx: number, patch: any) => {
  updateItem(idx, patch)
}, 150)

const tab    = ref('form')
const saving = ref(false)
const isEdit = ref(false)
const hasUnsavedChanges = ref(false)

onBeforeRouteLeave((_to, _from, next) => {
  if (hasUnsavedChanges.value) {
    confirm({
      title: 'Unsaved changes',
      message: 'You have unsaved changes. Leave without saving?',
      confirmText: 'Leave',
      cancelText: 'Stay',
      variant: 'warning',
    }).then(ok => next(ok))
  } else {
    next()
  }
})

// Import from invoice
const selectedImportInvoiceId = ref('')
const importedFromInvoice     = ref(false)

const form = reactive({
  id:             '',
  client_id:      '',
  amount:         0 as number,
  payment_date:   new Date().toISOString().split('T')[0],
  payment_method: 'bank_transfer',
  notes:          '',
  currency:       'MYR',
  invoice_id:     '' as string | undefined,
  invoice_number: '' as string | undefined,
  line_items:     [] as LineItem[],
  subtotal:       undefined as number | undefined,
  tax_rate:       undefined as number | undefined,
  tax_amount:     undefined as number | undefined,
})

watch(form, () => {
  hasUnsavedChanges.value = true
}, { deep: true })

const currencyOptions = [
  { value: 'MYR', label: 'MYR — Malaysian Ringgit' },
  { value: 'USD', label: 'USD — US Dollar' },
  { value: 'SGD', label: 'SGD — Singapore Dollar' },
  { value: 'EUR', label: 'EUR — Euro' },
  { value: 'GBP', label: 'GBP — British Pound' },
]

const paymentMethodOptions = [
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'cash',          label: 'Cash' },
  { value: 'online',        label: 'Online Payment' },
  { value: 'card',          label: 'Card' },
  { value: 'other',         label: 'Other' },
]

const clientOptions = computed(() =>
  clientStore.clients.map(c => ({ value: c.id, label: c.name }))
)

const invoiceOptions = computed(() =>
  invoiceStore.invoices.map(i => ({
    value: i.id,
    label: `${i.invoice_number} — ${i.client?.name ?? '?'} (${formatCurrency(i.total, i.currency)})`,
  }))
)

const selectedClientName = computed(() =>
  clientStore.clients.find(c => c.id === form.client_id)?.name ?? '—'
)

const selectedMethodLabel = computed(() =>
  paymentMethodOptions.find(m => m.value === form.payment_method)?.label ?? '—'
)

const linkedInvoiceStatus = computed(() =>
  invoiceStore.invoices.find(i => i.id === form.invoice_id)?.status ?? '—'
)

/** Data shape consumed by ReceiptPreview */
const previewData = computed<Partial<ReceiptPreviewData>>(() => ({
  receipt_number: isEdit.value ? (form as any).receipt_number : '(unsaved)',
  client:         clientStore.clients.find(c => c.id === form.client_id),
  payment_date:   form.payment_date,
  payment_method: form.payment_method as any,
  amount:         Number(form.amount),
  currency:       form.currency,
  notes:          form.notes,
  invoice_number: form.invoice_number,
  line_items:     form.line_items.length ? form.line_items : undefined,
  subtotal:       form.subtotal,
  tax_rate:       form.tax_rate,
  tax_amount:     form.tax_amount,
}))

// ── Line item helpers ─────────────────────────────────────────────────────────
function updateItem(idx: number, patch: Partial<LineItem>) {
  const item    = { ...form.line_items[idx], ...patch }
  item.amount   = item.quantity * item.unit_price
  form.line_items[idx] = item
  recalc()
}

function removeItem(idx: number) {
  form.line_items.splice(idx, 1)
  recalc()
}

function recalc() {
  const subtotal   = form.line_items.reduce((s, i) => s + i.amount, 0)
  const taxAmt     = subtotal * ((form.tax_rate ?? 0) / 100)
  form.subtotal   = subtotal
  form.tax_amount = taxAmt
  form.amount     = subtotal + taxAmt
}

// ── Import from invoice ───────────────────────────────────────────────────────
async function importFromInvoice() {
  const id = selectedImportInvoiceId.value
  if (!id) return

  const { data: inv } = await invoiceService.getById(id)
  if (!inv) return

  form.client_id      = inv.client_id
  form.currency       = inv.currency
  form.invoice_id     = inv.id
  form.invoice_number = inv.invoice_number
  form.line_items     = (inv.line_items ?? []).map((li: LineItem) => ({ ...li }))
  form.subtotal       = inv.subtotal
  form.tax_rate       = inv.tax_rate
  form.tax_amount     = inv.tax_amount
  form.amount         = inv.total

  importedFromInvoice.value = true
  showToast(`Imported from ${inv.invoice_number}`)
}

function clearImport() {
  form.invoice_id     = undefined
  form.invoice_number = undefined
  form.line_items     = []
  form.subtotal       = undefined
  form.tax_rate       = undefined
  form.tax_amount     = undefined
  importedFromInvoice.value = false
  selectedImportInvoiceId.value = ''
}

// ── Save ──────────────────────────────────────────────────────────────────────
async function save() {
  if (!auth.user) return

  // Basic validation
  if (!form.client_id) { showToast('Please select a client', 'danger'); return }
  if (!form.amount || Number(form.amount) <= 0) { showToast('Please enter an amount', 'danger'); return }
  if (!form.payment_date) { showToast('Please set a payment date', 'danger'); return }

  // If linked to an invoice that isn't already paid, ask whether to mark it paid
  let markInvoicePaid = false
  if (form.invoice_id) {
    const linkedInvoice = invoiceStore.invoices.find(i => i.id === form.invoice_id)
    if (linkedInvoice && linkedInvoice.status !== 'paid') {
      markInvoicePaid = await confirm({
        title: 'Mark invoice as paid',
        message: `Mark invoice ${form.invoice_number} as paid?\n\nChoose Confirm to mark it paid, or Cancel to leave it as "${linkedInvoice.status}".`,
        confirmText: 'Mark as Paid',
        cancelText: 'Leave as-is',
        variant: 'info',
      })
    }
  }

  saving.value = true
  try {
    const payload: Record<string, any> = {
      user_id:        auth.user.id,
      client_id:      form.client_id,
      amount:         Number(form.amount),
      payment_date:   form.payment_date,
      payment_method: form.payment_method,
      currency:       form.currency,
      notes:          form.notes || null,
      invoice_id:     form.invoice_id || null,
    }

    if (isEdit.value && form.id) {
      const { error } = await receiptService.update(form.id, payload)
      if (error) throw error
      hasUnsavedChanges.value = false
      showToast('Receipt updated!')
    } else {
      // Pass empty string so DB trigger auto_receipt_number fills it in
      const { error } = await receiptService.create({ ...payload, receipt_number: '' })
      if (error) throw error
      hasUnsavedChanges.value = false
      showToast('Receipt saved!')
    }

    // Mark the linked invoice as paid if the user confirmed
    if (markInvoicePaid && form.invoice_id) {
      const { error } = await invoiceService.updateStatus(form.invoice_id, 'paid')
      if (error) {
        showToast('Receipt saved, but failed to update invoice status', 'warning')
      } else {
        // Update the store in-memory so the invoice list reflects it immediately
        const idx = invoiceStore.invoices.findIndex(i => i.id === form.invoice_id)
        if (idx > -1) invoiceStore.invoices[idx] = { ...invoiceStore.invoices[idx], status: 'paid' }
        showToast(`Invoice ${form.invoice_number} marked as paid!`)
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } })
      }
    }

    router.push('/app/receipts')
  } catch (err: any) {
    showToast(err?.message ?? 'Failed to save receipt. Please try again.', 'danger')
  } finally {
    saving.value = false
  }
}

// ── PDF export ────────────────────────────────────────────────────────────────
async function exportPdf() {
  if (tab.value !== 'preview') {
    tab.value = 'preview'
    await nextTick()
  }
  const filename = (form as any).receipt_number ?? 'receipt'
  await exportToPdf('receipt-preview', filename)
  showToast('PDF exported!')
}

// ── Init ──────────────────────────────────────────────────────────────────────
onMounted(async () => {
  await Promise.all([
    clientStore.fetchAll(),
    invoiceStore.fetchAll(),
    templateStore.fetchAll(),
  ])

  // Check for ?invoice= query param (deep link from invoice list)
  const invoiceParam = route.query.invoice as string | undefined
  if (invoiceParam) {
    selectedImportInvoiceId.value = invoiceParam
    await importFromInvoice()
  }

  // Edit mode
  if (route.params.id) {
    isEdit.value = true
    const { data, error } = await receiptService.getById(route.params.id as string)
    if (error) { showToast('Failed to load receipt', 'danger'); return }
    if (data) {
      form.id             = data.id
      form.client_id      = data.client_id
      form.amount         = Number(data.amount)
      form.payment_date   = data.payment_date
      form.payment_method = data.payment_method
      form.currency       = data.currency
      form.notes          = data.notes ?? ''
      form.invoice_id     = data.invoice_id ?? undefined
      ;(form as any).receipt_number = data.receipt_number

      // If linked to an invoice, fetch its number for display
      if (data.invoice_id) {
        const { data: inv } = await invoiceService.getById(data.invoice_id)
        if (inv) {
          form.invoice_number = inv.invoice_number
          importedFromInvoice.value = true
        }
      }
    }
  }
})
</script>

<style scoped>
.page {
  padding: 32px 36px;
  max-width: 1100px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Header */
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.header-left { display: flex; flex-direction: column; gap: 4px; }

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  text-decoration: none;
  transition: color .12s;
}
.back-link:hover { color: #6366f1; }

.page-title { font-size: 24px; font-weight: 800; color: #0f172a; margin: 0; letter-spacing: -0.5px; }

.header-actions { display: flex; align-items: center; gap: 8px; }

.desktop-only { display: flex; }
@media (max-width: 768px) {
  .desktop-only { display: none !important; }
}

/* Import banner */
.import-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 18px;
  background: #f0f4ff;
  border: 1.5px solid #c7d2fe;
  border-radius: 12px;
  flex-wrap: wrap;
}

.import-banner-text {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 13px;
  font-weight: 500;
  color: #4338ca;
  flex: 1;
  min-width: 200px;
}

.import-select { flex: 1; min-width: 220px; max-width: 360px; }

/* Imported badge */
.imported-badge {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 8px 14px;
  background: #d1fae5;
  border: 1.5px solid #6ee7b7;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  color: #065f46;
}

.clear-import {
  margin-left: auto;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 13px;
  color: #6ee7b7;
  padding: 0 2px;
  line-height: 1;
}
.clear-import:hover { color: #065f46; }

/* Builder layout */
.builder-layout {
  display: grid;
  grid-template-columns: 1fr 260px;
  gap: 20px;
  align-items: start;
}

.builder-form { display: flex; flex-direction: column; gap: 16px; }

/* Cards */
.form-card, .summary-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  box-shadow: 0 1px 3px rgba(0,0,0,.05);
  overflow: hidden;
}

.card-header {
  padding: 14px 20px 12px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-title    { font-size: 14px; font-weight: 700; color: #0f172a; margin: 0; }
.card-subtitle { font-size: 12px; color: #94a3b8; margin-left: auto; }

.card-body {
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* Fields */
.field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

.field { display: flex; flex-direction: column; gap: 5px; }

.field label {
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

/* Line items */
.line-items-table {
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  overflow: hidden;
}

.li-header {
  display: grid;
  grid-template-columns: 1fr 70px 90px 100px 36px;
  padding: 8px 12px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  font-size: 11px;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.li-row {
  display: grid;
  grid-template-columns: 1fr 70px 90px 100px 36px;
  align-items: center;
  border-bottom: 1px solid #f1f5f9;
}
.li-row:last-child { border-bottom: none; }

.li-input {
  padding: 10px 12px;
  border: none;
  outline: none;
  font-size: 14px;
  font-family: inherit;
  color: #0f172a;
  background: transparent;
  width: 100%;
  transition: background .1s;
}
.li-input:focus { background: #fafbff; }
.li-input::placeholder { color: #94a3b8; }
.li-input-num { text-align: right; }

.li-amount {
  padding: 10px 12px;
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
  font-variant-numeric: tabular-nums;
  text-align: right;
}

.li-del {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  border: none;
  background: none;
  cursor: pointer;
  color: #cbd5e1;
  transition: color .12s;
  padding: 10px 8px;
}
.li-del:hover { color: #ef4444; }

/* Totals */
.totals {
  border-top: 1px solid #f1f5f9;
  padding-top: 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.t-row { display: flex; justify-content: space-between; align-items: center; font-size: 14px; color: #374151; }
.t-label { color: #64748b; }
.t-value { font-variant-numeric: tabular-nums; font-weight: 600; color: #0f172a; }
.t-total { margin-top: 4px; padding-top: 12px; border-top: 1.5px solid #e2e8f0; }
.t-total-value { font-size: 18px; font-weight: 800; color: #6366f1; }

/* Preview */
.preview-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,.05);
}

/* Summary sidebar */
.builder-sidebar { position: sticky; top: 20px; }

.summary-body {
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.s-row { display: flex; justify-content: space-between; align-items: center; font-size: 13px; }
.s-label { color: #64748b; }
.s-value { font-weight: 600; color: #0f172a; }
.s-value.mono { font-variant-numeric: tabular-nums; }
.s-divider { height: 1px; background: #f1f5f9; margin: 2px 0; }
.s-total .s-label { font-weight: 700; color: #0f172a; font-size: 14px; }
.s-total .s-value { font-size: 16px; font-weight: 800; color: #6366f1; font-variant-numeric: tabular-nums; }

/* Invoice status badge in sidebar */
.inv-status-badge {
  display: inline-block;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 6px;
  text-transform: capitalize;
  letter-spacing: 0.2px;
}
.inv-status-draft    { background: #f1f5f9; color: #64748b; }
.inv-status-sent     { background: #dbeafe; color: #1d4ed8; }
.inv-status-paid     { background: #d1fae5; color: #065f46; }
.inv-status-overdue  { background: #fee2e2; color: #991b1b; }
.inv-status-cancelled{ background: #f1f5f9; color: #94a3b8; }
.inv-status-—        { background: #f1f5f9; color: #94a3b8; }

/* Responsive */
@media (max-width: 900px) {
  .builder-layout { grid-template-columns: 1fr; }
  .builder-sidebar { position: static; }
}

@media (max-width: 768px) {
  .page { padding: 20px 16px; }
  .field-row { grid-template-columns: 1fr; }
  .import-banner { flex-direction: column; align-items: stretch; }
  .li-header, .li-row { grid-template-columns: 1fr 60px 80px 36px; }
  .li-col-amt, .li-amount { display: none; }
}
</style>
