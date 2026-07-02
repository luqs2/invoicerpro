<template>
  <div class="page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-left">
        <router-link
          to="/app/purchase-orders"
          class="back-link"
        >
          <ArrowLeft :size="16" />
          <span class="back-text">Purchase Orders</span>
        </router-link>
        <h1 class="page-title">
          {{ isEdit ? 'Edit Purchase Order' : 'New Purchase Order' }}
        </h1>
      </div>
      <div class="header-actions desktop-only">
        <UiButton
          variant="outline"
          :disabled="saving"
          @click="exportPdf"
        >
          <Download :size="14" />
          Export PDF
        </UiButton>
        <UiButton
          :loading="saving"
          @click="save"
        >
          Save PO
        </UiButton>
      </div>
    </div>

    <!-- Two-column layout -->
    <div class="builder-layout">
      <!-- Left: form -->
      <div class="builder-form">
        <UiTabs
          v-model="tab"
          :tabs="[
            { value: 'form', label: 'Details' },
            { value: 'preview', label: 'Preview' },
          ]"
        />

        <!-- Details tab -->
        <template v-if="tab === 'form'">
          <!-- Vendor details -->
          <div class="form-card">
            <div class="card-header">
              <h2 class="card-title">
                Client & Details
              </h2>
            </div>
            <div class="card-body">
              <div class="field-row">
                <div class="field">
                  <label>Client Name</label>
                  <UiInput
                    v-model="form.client_name"
                    placeholder="e.g. Acme Corp"
                  />
                </div>
                <div class="field">
                  <label>Order Date</label>
                  <UiInput
                    v-model="form.order_date"
                    type="date"
                  />
                </div>
              </div>
              <div class="field-row">
                <div class="field">
                  <label>Email</label>
                  <UiInput
                    v-model="form.client_email"
                    type="email"
                    placeholder="client@example.com"
                  />
                </div>
                <div class="field">
                  <label>Phone</label>
                  <UiInput
                    v-model="form.client_phone"
                    placeholder="+60 12-345 6789"
                  />
                </div>
              </div>
              <div class="field">
                <label>Address</label>
                <UiTextarea
                  v-model="form.client_address"
                  placeholder="Street address, city, postal code"
                  :rows="2"
                />
              </div>
            </div>
          </div>

          <!-- Line items -->
          <div class="form-card">
            <div class="card-header">
              <h2 class="card-title">
                Items & Quantities
              </h2>
            </div>
            <div class="card-body">
              <div class="line-items-table">
                <div class="li-header">
                  <span class="li-col-desc">Item Description</span>
                  <span class="li-col-qty">Qty</span>
                  <span class="li-col-rate">Unit Price</span>
                  <span class="li-col-amt">Total</span>
                  <span class="li-col-del" />
                </div>
                <div
                  v-for="(item, idx) in form.line_items"
                  :key="idx"
                  class="li-row"
                >
                  <input
                    class="li-input"
                    :value="item.description"
                    placeholder="Description…"
                    @input="updateItem(idx, { description: ($event.target as HTMLInputElement).value })"
                  >
                  <input
                    class="li-input li-input-num"
                    type="number"
                    :value="item.quantity"
                    min="0"
                    @input="updateItem(idx, { quantity: Number(($event.target as HTMLInputElement).value) })"
                  >
                  <input
                    class="li-input li-input-num"
                    type="number"
                    :value="item.unit_price"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    @input="updateItem(idx, { unit_price: Number(($event.target as HTMLInputElement).value) })"
                  >
                  <span class="li-amount">{{ formatCurrency(item.quantity * item.unit_price, form.currency) }}</span>
                  <button
                    class="li-del"
                    title="Remove"
                    :aria-label="`Remove item ${idx + 1}`"
                    @click="removeItem(idx)"
                  >
                    <Trash2 :size="14" />
                  </button>
                </div>
              </div>
              <button
                class="add-item-btn"
                type="button"
                @click="addItem"
              >
                <PlusCircle :size="16" />
                Add Line Item
              </button>

              <!-- Totals -->
              <div class="totals">
                <div class="t-row">
                  <span class="t-label">Subtotal</span>
                  <span class="t-value">{{ formatCurrency(subtotal, form.currency) }}</span>
                </div>
                <div
                  v-if="form.tax_rate"
                  class="t-row"
                >
                  <span class="t-label">Tax ({{ form.tax_rate }}%)</span>
                  <span class="t-value">{{ formatCurrency(taxAmount, form.currency) }}</span>
                </div>
                <div class="t-row t-total">
                  <span class="t-label">Grand Total</span>
                  <span class="t-value t-total-value">{{ formatCurrency(grandTotal, form.currency) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Currency & Notes -->
          <div class="form-card">
            <div class="card-header">
              <h2 class="card-title">
                Currency & Notes
              </h2>
            </div>
            <div class="card-body">
              <div class="field-row">
                <div class="field">
                  <label>Currency</label>
                  <UiSelect
                    v-model="form.currency"
                    :options="currencyOptions"
                    placeholder="Select currency"
                  />
                </div>
                <div class="field">
                  <label>Tax Rate (%)</label>
                  <UiInput
                    v-model="form.tax_rate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    placeholder="0"
                  />
                </div>
              </div>
              <div class="field">
                <label>Notes</label>
                <UiTextarea
                  v-model="form.notes"
                  placeholder="Special instructions, payment terms…"
                  :rows="3"
                />
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="form-actions">
            <UiButton
              :loading="saving"
              @click="save"
            >
              Save & Preview
            </UiButton>
            <UiButton
              variant="outline"
              @click="discard"
            >
              Discard Draft
            </UiButton>
          </div>
        </template>

        <!-- Preview tab -->
        <div
          v-if="tab === 'preview'"
          class="preview-card"
        >
          <div id="po-preview">
            <PurchaseOrderPreview
              :purchase-order="form"
              :template="templateStore.active"
            />
          </div>
        </div>
      </div>

      <!-- Right: summary sidebar -->
      <div class="builder-sidebar">
        <div class="summary-card">
          <div class="card-header">
            <h2 class="card-title">
              Summary
            </h2>
          </div>
          <div class="summary-body">
            <div class="s-row">
              <span class="s-label">PO Number</span>
              <span class="s-value mono">{{ form.po_number || '—' }}</span>
            </div>
            <div class="s-row">
              <span class="s-label">Client</span>
              <span class="s-value">{{ selectedClientName }}</span>
            </div>
            <div class="s-row">
              <span class="s-label">Date</span>
              <span class="s-value">{{ formatDate(form.order_date) }}</span>
            </div>
            <div class="s-row">
              <span class="s-label">Items</span>
              <span class="s-value">{{ (form.line_items ?? []).length }}</span>
            </div>
            <div class="s-divider" />
            <div class="s-row s-total">
              <span class="s-label">Grand Total</span>
              <span class="s-value mono">{{ formatCurrency(grandTotal, form.currency) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Download, Trash2, PlusCircle } from '@lucide/vue'
import { usePurchaseOrderStore } from '@/stores/purchaseOrders'
import { useBusinessProfileStore } from '@/stores/businessProfile'
import { useTemplateStore } from '@/stores/templates'
import { useClientStore } from '@/stores/clients'
import { purchaseOrderService } from '@/services/purchaseOrders'
import PurchaseOrderPreview from '@/components/purchase-order/PurchaseOrderPreview.vue'
import { useFormatters } from '@/composables/useFormatters'
import { usePdf } from '@/composables/usePdf'
import { useToast } from '@/composables/useToast'
import UiButton from '@/components/ui/Button.vue'
import UiTabs from '@/components/ui/Tabs.vue'
import UiSelect from '@/components/ui/Select.vue'
import UiInput from '@/components/ui/Input.vue'
import UiTextarea from '@/components/ui/Textarea.vue'

const route = useRoute()
const router = useRouter()
const store = usePurchaseOrderStore()
const bpStore = useBusinessProfileStore()
const templateStore = useTemplateStore()
const clientStore = useClientStore()
const { formatCurrency } = useFormatters()
const { exportToPdf } = usePdf()
const { showToast } = useToast()

const tab = ref('form')
const saving = ref(false)
const isEdit = ref(false)

// Computed alias so template reactivity tracks store.current changes
const form = computed(() => store.current)

const currencyOptions = [
  { value: 'MYR', label: 'MYR — Malaysian Ringgit' },
  { value: 'USD', label: 'USD — US Dollar' },
  { value: 'SGD', label: 'SGD — Singapore Dollar' },
  { value: 'EUR', label: 'EUR — Euro' },
  { value: 'GBP', label: 'GBP — British Pound' },
]

const selectedClientName = computed(() =>
  form.value.client_name || '—'
)

const subtotal = computed(() => {
  const items = store.current.line_items ?? []
  return items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0)
})

const taxAmount = computed(() =>
  subtotal.value * ((store.current.tax_rate ?? 0) / 100)
)

const grandTotal = computed(() =>
  subtotal.value + taxAmount.value
)

function formatDate(dateStr?: string) {
  if (!dateStr) return '—'
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

function addItem() {
  store.addLineItem()
}

function removeItem(idx: number) {
  store.removeLineItem(idx)
}

function updateItem(idx: number, patch: { description?: string; quantity?: number; unit_price?: number }) {
  store.updateLineItem(idx, patch)
}

function discard() {
  if (confirm('Discard this draft?')) {
    store.resetCurrent()
    router.push('/app/purchase-orders')
  }
}

async function save() {
  if (!form.value.client_name) { showToast('Please enter a client name', 'danger'); return }
  const items = form.value.line_items ?? []
  if (items.length === 0) { showToast('Add at least one item', 'danger'); return }

  saving.value = true
  try {
    await store.save()
    showToast('Purchase order saved!')
    router.push('/app/purchase-orders')
  } catch (err: any) {
    showToast(err?.message ?? 'Failed to save. Please try again.', 'danger')
  } finally {
    saving.value = false
  }
}

async function exportPdf() {
  if (tab.value !== 'preview') {
    tab.value = 'preview'
  }
  await exportToPdf('po-preview', store.current.po_number || 'purchase-order')
  showToast('PDF exported!')
}

onMounted(async () => {
  bpStore.fetch()
  templateStore.fetchAll()
  clientStore.fetchAll()

  if (route.params.id) {
    isEdit.value = true
    const { data, error } = await purchaseOrderService.getById(route.params.id as string)
    if (error) { showToast('Failed to load purchase order', 'danger'); return }
    if (data) {
      Object.assign(store.current, data)
    }
  } else {
    store.resetCurrent()
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
  color: #414846;
  text-decoration: none;
  transition: color .12s;
}
.back-link:hover { color: #08241f; }

.page-title {
  font-family: 'Merriweather', Georgia, serif;
  font-size: 24px;
  font-weight: 700;
  color: #1e1b15;
  margin: 0;
  letter-spacing: -0.02em;
}

.header-actions { display: flex; align-items: center; gap: 8px; }
.desktop-only { display: flex; }
@media (max-width: 768px) { .desktop-only { display: none !important; } }

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
  background: #F7F4EC;
  border: 1px solid #D6D0C2;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(38,35,29,.05);
  overflow: hidden;
}

.card-header {
  padding: 14px 20px 12px;
  border-bottom: 1px solid #f4ede3;
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-title {
  font-family: 'Merriweather', Georgia, serif;
  font-size: 14px;
  font-weight: 700;
  color: #1e1b15;
  margin: 0;
}

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
  color: #414846;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

/* Line items */
.line-items-table {
  border: 1px solid #D6D0C2;
  border-radius: 8px;
  overflow: hidden;
}

.li-header {
  display: grid;
  grid-template-columns: 1fr 70px 90px 100px 36px;
  padding: 8px 12px;
  background: #EDE8DE;
  border-bottom: 1px solid #D6D0C2;
  font-size: 11px;
  font-weight: 700;
  color: #414846;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.li-row {
  display: grid;
  grid-template-columns: 1fr 70px 90px 100px 36px;
  align-items: center;
  border-bottom: 1px solid #f4ede3;
}
.li-row:last-child { border-bottom: none; }

.li-input {
  padding: 10px 12px;
  border: none;
  outline: none;
  font-size: 14px;
  font-family: inherit;
  color: #1e1b15;
  background: transparent;
  width: 100%;
  transition: background .1s;
}
.li-input:focus { background: rgba(8,36,31,.02); }
.li-input::placeholder { color: #414846; }
.li-input-num { text-align: right; }

.li-amount {
  padding: 10px 12px;
  font-size: 14px;
  font-weight: 600;
  color: #1e1b15;
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
  color: #c1c8c5;
  transition: color .12s;
  padding: 10px 8px;
}
.li-del:hover { color: #dc2626; }

.add-item-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  padding: 10px;
  background: #EDE8DE;
  border: 1px solid #D6D0C2;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #08241f;
  cursor: pointer;
  font-family: inherit;
  transition: background .12s;
}
.add-item-btn:hover { background: #f4ede3; }

/* Totals */
.totals {
  border-top: 1px solid #f4ede3;
  padding-top: 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.t-row { display: flex; justify-content: space-between; align-items: center; font-size: 14px; color: #414846; }
.t-label { color: #414846; }
.t-value { font-variant-numeric: tabular-nums; font-weight: 600; color: #1e1b15; }
.t-total { margin-top: 4px; padding-top: 12px; border-top: 1.5px solid #D6D0C2; }
.t-total-value { font-size: 18px; font-weight: 800; color: #B5652D; }

/* Form actions */
.form-actions {
  display: flex;
  gap: 12px;
}

/* Preview */
.preview-card {
  background: #ffffff;
  border: 1px solid #D6D0C2;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 4px rgba(38,35,29,.05);
}

#po-preview {
  background: #ffffff;
}

.po-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 60px;
}

.po-brand {
  font-family: 'Merriweather', Georgia, serif;
  font-size: 28px;
  font-weight: 700;
  color: #08241f;
  margin: 0;
  line-height: 1.2;
}

.po-brand-address {
  font-size: 13px;
  color: #414846;
  line-height: 1.6;
  margin: 4px 0 0;
}

.po-header-right { text-align: right; }

.po-doc-title {
  font-family: 'Merriweather', Georgia, serif;
  font-size: 32px;
  font-weight: 700;
  color: #B5652D;
  margin: 0;
  letter-spacing: -0.02em;
}

.po-doc-no {
  font-size: 13px;
  font-weight: 600;
  color: #08241f;
  margin: 4px 0 0;
  letter-spacing: 0.05em;
}

.po-doc-date {
  font-size: 12px;
  color: #414846;
  margin: 2px 0 0;
  letter-spacing: 0.05em;
}

.po-parties {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 48px;
  margin-bottom: 32px;
}

.po-party-label {
  font-size: 12px;
  font-weight: 600;
  color: #414846;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin: 0 0 8px;
}

.po-party-name {
  font-size: 16px;
  font-weight: 700;
  color: #08241f;
  margin: 0 0 4px;
}

.po-party-detail {
  font-size: 14px;
  color: #414846;
  line-height: 1.6;
  margin: 0;
}

.po-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 24px;
}

.po-table thead {
  border-bottom: 2px solid #08241f;
}

.po-table th {
  padding: 8px 0;
  font-size: 13px;
  font-weight: 600;
  color: #08241f;
  text-align: left;
  letter-spacing: 0.05em;
}

.po-table td {
  padding: 12px 0;
  font-size: 14px;
  color: #1e1b15;
  border-bottom: 1px solid rgba(193,200,197,.3);
}

.text-center { text-align: center; }
.text-right { text-align: right; }
.font-bold { font-weight: 700; }

.po-totals {
  border-top: 2px solid #08241f;
  padding-top: 16px;
}

.po-total-row {
  display: flex;
  justify-content: flex-end;
  gap: 40px;
  margin-bottom: 8px;
  font-size: 14px;
  color: #414846;
}

.po-grand-total {
  padding-top: 8px;
  border-top: 1px solid #D6D0C2;
  font-weight: 700;
  color: #08241f;
  font-size: 16px;
}

.po-grand-total span:last-child {
  font-family: 'Merriweather', Georgia, serif;
  font-size: 18px;
  color: #B5652D;
}

.po-footer-note {
  margin-top: 24px;
  font-size: 11px;
  color: #414846;
  font-style: italic;
  line-height: 1.6;
  border-top: 1px solid #D6D0C2;
  padding-top: 16px;
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
.s-label { color: #414846; }
.s-value { font-weight: 600; color: #1e1b15; }
.s-value.mono { font-variant-numeric: tabular-nums; }
.s-divider { height: 1px; background: #f4ede3; margin: 2px 0; }
.s-total .s-label { font-weight: 700; color: #1e1b15; font-size: 14px; }
.s-total .s-value { font-size: 16px; font-weight: 800; color: #B5652D; font-variant-numeric: tabular-nums; }

/* ── Dark mode (Nocturnal Ledger) ─────────────────────── */
.dark .form-card, .dark .summary-card {
  background: #1d201f;
  border: 1px solid rgba(255,255,255,.05);
}
.dark .card-header { border-color: rgba(255,255,255,.05); }
.dark .card-title { color: #e1e3e1; }
.dark .field label { color: #c0c8c4; }
.dark .page-title { color: #e1e3e1; }
.dark .back-link { color: #c0c8c4; }
.dark .back-link:hover { color: #a0d0c2; }

/* Line items */
.dark .line-items-table { border: 1px solid rgba(255,255,255,.05); }
.dark .li-header { background: #282b29; border-color: rgba(255,255,255,.05); color: #c0c8c4; }
.dark .li-row { border-color: rgba(255,255,255,.05); }
.dark .li-row:nth-child(even) { background: rgba(255,255,255,.02); }
.dark .li-input { color: #e1e3e1; }
.dark .li-input::placeholder { color: #8a938f; }
.dark .li-input:focus { border-color: #e6c45c; box-shadow: 0 0 0 2px rgba(230,196,92,.2); }
.dark .li-amount { color: #e1e3e1; }
.dark .li-del { color: #404945; }
.dark .li-del:hover { color: #ffb4ab; }
.dark .add-item-btn { background: #282b29; border: 1px solid rgba(255,255,255,.05); color: #a0d0c2; }
.dark .add-item-btn:hover { background: #323534; }

/* Totals */
.dark .t-label { color: #c0c8c4; }
.dark .t-value { color: #e1e3e1; }
.dark .t-total { border-color: rgba(255,255,255,.05); }

/* Preview */
.dark .preview-card { background: #111413; border: 1px solid rgba(255,255,255,.05); }
.dark #po-preview { background: #111413; }

/* Summary sidebar */
.dark .s-label { color: #c0c8c4; }
.dark .s-value { color: #e1e3e1; }
.dark .s-divider { background: rgba(255,255,255,.05); }

/* Responsive */
@media (max-width: 900px) {
  .builder-layout { grid-template-columns: 1fr; }
  .builder-sidebar { position: static; }
}

@media (max-width: 768px) {
  .page { padding: 20px 16px; }
  .field-row { grid-template-columns: 1fr; }
  .li-header, .li-row { grid-template-columns: 1fr 60px 80px 36px; }
  .li-col-amt, .li-amount { display: none; }
}
</style>
