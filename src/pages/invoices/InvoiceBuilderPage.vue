<template>
  <div class="page">

    <!-- Header -->
    <div class="page-header">
      <div class="header-left">
        <router-link to="/app/invoices" class="back-link">
          <ArrowLeft :size="16" />
          Invoices
        </router-link>
        <h1 class="page-title">{{ isEdit ? 'Edit Invoice' : 'New Invoice' }}</h1>
      </div>
      <div class="header-actions">
        <UiButton variant="outline" @click="saveDraft" :loading="saving === 'draft'">Save Draft</UiButton>
        <UiButton @click="saveInvoice" :loading="saving === 'save'">
          <Save :size="14" />
          Save Invoice
        </UiButton>
        <UiButton variant="outline" @click="send" :loading="saving === 'send'">
          <Send :size="14" />
          Send
        </UiButton>
      </div>
    </div>

    <!-- Two-column layout -->
    <div class="builder-layout">

      <!-- Left: form -->
      <div class="builder-form">

        <!-- Tab nav -->
        <UiTabs v-model="tab" :tabs="[
          { value: 'form',    label: 'Details' },
          { value: 'preview', label: 'Preview' },
        ]" />

        <!-- Details tab -->
        <template v-if="tab === 'form'">

          <!-- Invoice metadata -->
          <div class="form-card">
            <div class="card-header">
              <h2 class="card-title">Invoice Details</h2>
            </div>
            <div class="card-body">
              <div class="field-row">
                <div class="field">
                  <label>Invoice Number</label>
                  <UiInput v-model="store.current.invoice_number" placeholder="INV-0001" />
                </div>
                <div class="field">
                  <label>Currency</label>
                  <UiSelect v-model="store.current.currency" :options="currencyOptions" placeholder="Select currency" />
                </div>
              </div>
              <div class="field-row">
                <div class="field">
                  <label>Issue Date</label>
                  <UiInput v-model="store.current.issue_date" type="date" />
                </div>
                <div class="field">
                  <label>Due Date</label>
                  <UiInput v-model="store.current.due_date" type="date" />
                </div>
              </div>
            </div>
          </div>

          <!-- Client -->
          <div class="form-card">
            <div class="card-header">
              <h2 class="card-title">Bill To</h2>
            </div>
            <div class="card-body">
              <div class="field">
                <label>Client</label>
                <UiSelect
                  v-model="store.current.client_id"
                  :options="clientOptions"
                  placeholder="Select client…"
                />
              </div>
            </div>
          </div>

          <!-- Line items -->
          <div class="form-card">
            <div class="card-header">
              <h2 class="card-title">Line Items</h2>
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
                <div
                  v-for="(item, idx) in store.current.line_items"
                  :key="item.id"
                  class="li-row"
                >
                  <input
                    class="li-input"
                    :value="item.description"
                    placeholder="Service or product…"
                    @input="store.updateLineItem(idx, { description: ($event.target as HTMLInputElement).value })"
                  />
                  <input
                    class="li-input li-input-num"
                    type="number"
                    :value="item.quantity"
                    min="0"
                    @input="store.updateLineItem(idx, { quantity: Number(($event.target as HTMLInputElement).value) })"
                  />
                  <input
                    class="li-input li-input-num"
                    type="number"
                    :value="item.unit_price"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    @input="store.updateLineItem(idx, { unit_price: Number(($event.target as HTMLInputElement).value) })"
                  />
                  <span class="li-amount">{{ formatCurrency(item.amount, store.current.currency) }}</span>
                  <button class="li-del" @click="store.removeLineItem(idx)" title="Remove" :aria-label="`Remove line item ${idx + 1}`">
                    <Trash2 :size="14" />
                  </button>
                </div>
              </div>

              <UiButton variant="outline" size="sm" @click="store.addLineItem()" class="add-item-btn">
                <Plus :size="14" />
                Add Item
              </UiButton>

              <!-- Totals -->
              <div class="totals">
                <div class="t-row">
                  <span class="t-label">Subtotal</span>
                  <span class="t-value">{{ formatCurrency(store.current.subtotal ?? 0, store.current.currency) }}</span>
                </div>
                <div class="t-row">
                  <div class="t-label-with-input">
                    <span>Tax</span>
                    <div class="tax-input-wrap">
                      <input
                        type="number"
                        class="tax-input"
                        :value="store.current.tax_rate"
                        min="0"
                        max="100"
                        @input="store.current.tax_rate = Number(($event.target as HTMLInputElement).value); store.recalcTotals()"
                      />
                      <span class="tax-suffix">%</span>
                    </div>
                  </div>
                  <span class="t-value">{{ formatCurrency(store.current.tax_amount ?? 0, store.current.currency) }}</span>
                </div>
                <div class="t-row t-total">
                  <span class="t-label">Total Due</span>
                  <span class="t-value t-total-value">{{ formatCurrency(store.current.total ?? 0, store.current.currency) }}</span>
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
                v-model="store.current.notes"
                placeholder="Payment terms, bank details, thank you note…"
                :rows="3"
              />
            </div>
          </div>

        </template>

        <!-- Preview tab -->
        <div v-if="tab === 'preview'" class="preview-card">
          <div class="preview-actions">
            <UiButton variant="outline" @click="exportPdf">
              <Download :size="14" />
              Export PDF
            </UiButton>
          </div>
          <InvoicePreview id="invoice-preview" :invoice="store.current" :template="templateStore.active" />
        </div>

      </div>

      <!-- Right: live summary sidebar -->
      <div class="builder-sidebar">
        <div class="summary-card">
          <div class="card-header">
            <h2 class="card-title">Summary</h2>
          </div>
          <div class="summary-body">
            <div class="s-row">
              <span class="s-label">Invoice #</span>
              <span class="s-value mono">{{ store.current.invoice_number || '—' }}</span>
            </div>
            <div class="s-row">
              <span class="s-label">Client</span>
              <span class="s-value">{{ selectedClientName }}</span>
            </div>
            <div class="s-row">
              <span class="s-label">Due</span>
              <span class="s-value">{{ store.current.due_date || '—' }}</span>
            </div>
            <div class="s-divider" />
            <div class="s-row">
              <span class="s-label">Subtotal</span>
              <span class="s-value mono">{{ formatCurrency(store.current.subtotal ?? 0, store.current.currency) }}</span>
            </div>
            <div class="s-row">
              <span class="s-label">Tax ({{ store.current.tax_rate ?? 0 }}%)</span>
              <span class="s-value mono">{{ formatCurrency(store.current.tax_amount ?? 0, store.current.currency) }}</span>
            </div>
            <div class="s-divider" />
            <div class="s-row s-total">
              <span class="s-label">Total</span>
              <span class="s-value mono">{{ formatCurrency(store.current.total ?? 0, store.current.currency) }}</span>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- Mobile floating summary bar -->
    <div class="mobile-summary-bar">
      <div class="msb-left">
        <span class="msb-label">Total</span>
        <span class="msb-value">{{ formatCurrency(store.current.total ?? 0, store.current.currency) }}</span>
      </div>
      <UiButton size="sm" @click="saveInvoice" :loading="saving === 'save'">
        Save
      </UiButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, defineAsyncComponent } from 'vue'
import { useRoute, onBeforeRouteLeave } from 'vue-router'
import { ArrowLeft, Send, Trash2, Plus, Download, Save } from '@lucide/vue'
import { useInvoiceStore } from '@/stores/invoices'
import { useClientStore } from '@/stores/clients'
import { useTemplateStore } from '@/stores/templates'
import { useFormatters } from '@/composables/useFormatters'
import { usePdf } from '@/composables/usePdf'
import { useToast } from '@/composables/useToast'
import UiButton from '@/components/ui/Button.vue'

const InvoicePreview = defineAsyncComponent(() => import('@/components/invoice/InvoicePreview.vue'))
import UiTabs from '@/components/ui/Tabs.vue'
import UiSelect from '@/components/ui/Select.vue'
import UiInput from '@/components/ui/Input.vue'
import UiTextarea from '@/components/ui/Textarea.vue'

const route         = useRoute()
const store         = useInvoiceStore()
const clientStore   = useClientStore()
const templateStore = useTemplateStore()
const { formatCurrency } = useFormatters()
const { exportToPdf }    = usePdf()
const { showToast }      = useToast()

const tab    = ref('form')
const saving = ref<'draft' | 'save' | 'send' | null>(null)
const isEdit = ref(false)
const hasUnsavedChanges = ref(false)

onBeforeRouteLeave((_to, _from, next) => {
  if (hasUnsavedChanges.value) {
    const ok = window.confirm('You have unsaved changes. Leave anyway?')
    next(ok)
  } else {
    next()
  }
})

watch(() => store.current, () => {
  hasUnsavedChanges.value = true
}, { deep: true })

const currencyOptions = [
  { value: 'MYR', label: 'MYR — Malaysian Ringgit (RM)' },
  { value: 'USD', label: 'USD — US Dollar ($)' },
  { value: 'SGD', label: 'SGD — Singapore Dollar (S$)' },
  { value: 'EUR', label: 'EUR — Euro (€)' },
  { value: 'GBP', label: 'GBP — British Pound (£)' },
]

const clientOptions = computed(() =>
  clientStore.clients.map(c => ({ value: c.id, label: c.name }))
)

const selectedClientName = computed(() => {
  const c = clientStore.clients.find(c => c.id === store.current.client_id)
  return c?.name ?? '—'
})

onMounted(async () => {
  await clientStore.fetchAll()
  await templateStore.fetchAll()
  if (route.params.id) {
    isEdit.value = true
    // Load existing invoice into store
    const { data, error } = await import('@/services/invoices').then(m =>
      m.invoiceService.getById(route.params.id as string)
    )
    if (error) { showToast('Failed to load invoice', 'danger'); return }
    if (data) {
      // Ensure every line item has an id (Supabase JSONB may strip them)
      store.current = {
        ...data,
        line_items: (data.line_items ?? []).map((li: any) => ({
          id: li.id ?? crypto.randomUUID(),
          description: li.description ?? '',
          quantity:    Number(li.quantity ?? 1),
          unit_price:  Number(li.unit_price ?? 0),
          amount:      Number(li.amount ?? 0),
        })),
      }
    }
  } else {
    store.resetCurrent()
    const { useBusinessProfileStore } = await import('@/stores/businessProfile')
    const bpStore = useBusinessProfileStore()
    await bpStore.fetch()
    const p = bpStore.profile
    if (p.default_currency) store.current.currency  = p.default_currency
    if (p.default_tax_rate) store.current.tax_rate  = p.default_tax_rate
    store.recalcTotals()
  }
})

async function saveDraft() {
  saving.value = 'draft'
  try {
    store.current.status = 'draft'
    await store.save()
    hasUnsavedChanges.value = false
    showToast('Saved as draft')
  } catch (err: any) {
    showToast(err?.message ?? 'Failed to save draft', 'danger')
  } finally {
    saving.value = null
  }
}

async function saveInvoice() {
  saving.value = 'save'
  try {
    // Keep current status (draft stays draft, paid stays paid, etc.)
    // Only set to draft if it's a brand-new invoice with no status
    if (!store.current.status) store.current.status = 'draft'
    await store.save()
    hasUnsavedChanges.value = false
    showToast('Invoice saved!')
  } catch (err: any) {
    showToast(err?.message ?? 'Failed to save invoice', 'danger')
  } finally {
    saving.value = null
  }
}

async function send() {
  saving.value = 'send'
  try {
    if (store.current.id) {
      await store.updateStatus(store.current.id, 'sent')
      store.current.status = 'sent'
    } else {
      store.current.status = 'sent'
      await store.save()
    }
    hasUnsavedChanges.value = false
    showToast('Invoice marked as sent!')
  } catch (err: any) {
    showToast(err?.message ?? 'Failed to update invoice', 'danger')
  } finally {
    saving.value = null
  }
}

async function exportPdf() {
  await exportToPdf('invoice-preview', store.current.invoice_number ?? 'invoice')
  showToast('PDF exported!')
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

/* Header */
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

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

/* Builder layout */
.builder-layout {
  display: grid;
  grid-template-columns: 1fr 260px;
  gap: 20px;
  align-items: start;
}

.builder-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

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
}

.card-title { font-size: 14px; font-weight: 700; color: #0f172a; margin: 0; }

.card-body {
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* Fields */
.field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.field label {
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

/* Line items table */
.line-items-table {
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  overflow: hidden;
}

.li-header {
  display: grid;
  grid-template-columns: 1fr 70px 90px 100px 36px;
  gap: 0;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  font-size: 11px;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.li-header span {
  padding: 8px 10px;
}

.li-header span:first-child {
  padding-left: 12px;
}

.li-row {
  display: grid;
  grid-template-columns: 1fr 70px 90px 100px 36px;
  gap: 0;
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
  min-width: 0;
  transition: background .1s;
}
.li-input:focus { background: #fafbff; }
.li-input::placeholder { color: #94a3b8; }

.li-input-num { text-align: right; }

.li-amount {
  padding: 10px 12px;
  font-size: 13px;
  font-weight: 600;
  color: #0f172a;
  font-variant-numeric: tabular-nums;
  text-align: right;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.li-del {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 100%;
  border: none;
  background: none;
  cursor: pointer;
  color: #cbd5e1;
  transition: color .12s;
  padding: 10px 8px;
}
.li-del:hover { color: #ef4444; }

.add-item-btn { align-self: flex-start; margin-top: 4px; }

/* Totals */
.totals {
  border-top: 1px solid #f1f5f9;
  padding-top: 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.t-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  color: #374151;
}

.t-label { color: #64748b; }
.t-value { font-variant-numeric: tabular-nums; font-weight: 600; color: #0f172a; }

.t-label-with-input {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tax-input-wrap {
  display: flex;
  align-items: center;
  border: 1.5px solid #e2e8f0;
  border-radius: 7px;
  overflow: hidden;
}

.tax-input {
  width: 52px;
  height: 28px;
  padding: 0 8px;
  border: none;
  outline: none;
  font-size: 13px;
  font-family: inherit;
  text-align: right;
  color: #0f172a;
  background: #f8fafc;
}

.tax-suffix {
  padding: 0 7px;
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  background: #f1f5f9;
  height: 28px;
  display: flex;
  align-items: center;
  border-left: 1px solid #e2e8f0;
}

.t-total { margin-top: 4px; padding-top: 12px; border-top: 1.5px solid #e2e8f0; }
.t-total-value { font-size: 18px; font-weight: 800; color: #6366f1; }

/* Preview */
.preview-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,.05);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.preview-actions { display: flex; justify-content: flex-end; }

/* Summary sidebar */
.builder-sidebar { position: sticky; top: 20px; }

.summary-body {
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.s-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
}

.s-label { color: #64748b; }
.s-value { font-weight: 600; color: #0f172a; }
.s-value.mono { font-variant-numeric: tabular-nums; }

.s-divider { height: 1px; background: #f1f5f9; margin: 2px 0; }

.s-total .s-label { font-weight: 700; color: #0f172a; font-size: 14px; }
.s-total .s-value { font-size: 16px; font-weight: 800; color: #6366f1; font-variant-numeric: tabular-nums; }

/* Responsive */
@media (max-width: 900px) {
  .builder-layout { grid-template-columns: 1fr; }
  .builder-sidebar { position: static; }
}

@media (max-width: 768px) {
  .page { padding: 20px 16px; padding-bottom: 80px; }
  .field-row { grid-template-columns: 1fr; }
  .line-items-table { border: none; background: none; }
  .li-header { display: none; }
  .li-row {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 14px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    margin-bottom: 8px;
  }
  .li-input { padding: 8px 0; background: transparent; }
  .li-input-num { text-align: left; }
  .li-amount {
    padding: 8px 0;
    text-align: left;
    font-size: 15px;
    font-weight: 700;
    color: #6366f1;
  }
  .li-del {
    position: absolute;
    top: 12px;
    right: 12px;
  }
  .li-row { position: relative; }
  .add-item-btn { width: 100%; justify-content: center; }
}

/* Mobile floating summary */
.mobile-summary-bar {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #ffffff;
  border-top: 1px solid #e2e8f0;
  padding: 12px 16px;
  align-items: center;
  justify-content: space-between;
  z-index: 50;
  box-shadow: 0 -2px 10px rgba(0,0,0,.08);
}

.msb-left {
  display: flex;
  flex-direction: column;
}

.msb-label {
  font-size: 11px;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.msb-value {
  font-size: 20px;
  font-weight: 800;
  color: #6366f1;
  font-variant-numeric: tabular-nums;
}

@media (max-width: 900px) {
  .mobile-summary-bar { display: flex; }
}
</style>
