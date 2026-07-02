<template>
  <div
    class="po-preview"
    :style="{ fontFamily: font, color: bodyTextColor }"
  >
    <!-- Header -->
    <div class="po-header">
      <div class="po-header-left">
        <div
          v-if="businessLogo"
          class="po-logo"
        >
          <img
            :src="businessLogo"
            alt="Logo"
          >
        </div>
        <div
          v-else
          class="po-logo-fallback"
          :style="{ background: primary, borderRadius: radius }"
        >
          {{ businessInitials }}
        </div>
        <div>
          <h3
            class="po-brand"
            :style="{ color: primary }"
          >{{ businessName }}</h3>
          <p class="po-brand-detail">{{ businessAddress }}</p>
          <p
            v-if="businessEmail"
            class="po-brand-detail"
          >{{ businessEmail }}</p>
        </div>
      </div>
      <div class="po-header-right">
        <h2
          class="po-doc-title"
          :style="{ color: primary }"
        >Purchase Order</h2>
        <p
          class="po-doc-no"
          :style="{ color: primary }"
        >NO: {{ purchaseOrder.po_number || '(unsaved)' }}</p>
        <p class="po-doc-date">DATE: {{ formatDate(purchaseOrder.order_date) }}</p>
      </div>
    </div>

    <!-- Divider -->
    <div
      class="po-divider"
      :style="{ background: primary }"
    />

    <!-- Bill To -->
    <div class="po-parties">
      <div>
        <p
          class="po-party-label"
          :style="{ color: primary }"
        >Bill To</p>
        <p class="po-party-name">{{ purchaseOrder.client_name || '—' }}</p>
        <p
          v-if="purchaseOrder.client_address"
          class="po-party-detail"
        >{{ purchaseOrder.client_address }}</p>
        <p
          v-if="purchaseOrder.client_email"
          class="po-party-detail"
        >{{ purchaseOrder.client_email }}</p>
        <p
          v-if="purchaseOrder.client_phone"
          class="po-party-detail"
        >{{ purchaseOrder.client_phone }}</p>
      </div>
    </div>

    <!-- Items Table -->
    <table class="po-table">
      <thead>
        <tr :style="{ background: secondary }">
          <th :style="{ color: headerTextColor }">Description</th>
          <th
            class="text-center"
            :style="{ color: headerTextColor }"
          >Qty</th>
          <th
            class="text-right"
            :style="{ color: headerTextColor }"
          >Unit</th>
          <th
            class="text-right"
            :style="{ color: headerTextColor }"
          >Total</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(item, idx) in (purchaseOrder.line_items ?? [])"
          :key="idx"
        >
          <td>{{ item.description || '—' }}</td>
          <td class="text-center">{{ item.quantity }}</td>
          <td class="text-right">{{ formatCurrency(item.unit_price, purchaseOrder.currency) }}</td>
          <td class="text-right font-bold">{{ formatCurrency(item.quantity * item.unit_price, purchaseOrder.currency) }}</td>
        </tr>
      </tbody>
    </table>

    <!-- Totals -->
    <div class="po-totals">
      <div class="po-total-row">
        <span>Subtotal</span>
        <span>{{ formatCurrency(purchaseOrder.subtotal ?? 0, purchaseOrder.currency) }}</span>
      </div>
      <div
        v-if="purchaseOrder.tax_rate"
        class="po-total-row"
      >
        <span>Tax ({{ purchaseOrder.tax_rate }}%)</span>
        <span>{{ formatCurrency(purchaseOrder.tax_amount ?? 0, purchaseOrder.currency) }}</span>
      </div>
      <div
        class="po-total-row po-grand-total"
        :style="{ color: primary }"
      >
        <span>Grand Total</span>
        <span>{{ formatCurrency(purchaseOrder.total ?? 0, purchaseOrder.currency) }}</span>
      </div>
    </div>

    <!-- Notes -->
    <div
      v-if="purchaseOrder.notes"
      class="po-notes"
    >
      {{ purchaseOrder.notes }}
    </div>

    <!-- Footer -->
    <div
      class="po-footer"
      :style="{ borderTopColor: primary }"
    >
      Terms: Payment due within 30 days of receipt. Please reference {{ purchaseOrder.po_number || 'PO' }} on all correspondence.
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useBusinessProfileStore } from '@/stores/businessProfile'
import { useFormatters } from '@/composables/useFormatters'
import type { PurchaseOrder, InvoiceTemplate } from '@/types'

const props = defineProps<{
  purchaseOrder: Partial<PurchaseOrder>
  template?: InvoiceTemplate | null
}>()

const bpStore = useBusinessProfileStore()
const { formatCurrency } = useFormatters()

const primary         = computed(() => props.template?.primary_color   ?? '#08241f')
const secondary       = computed(() => props.template?.secondary_color ?? '#1f3a34')
const headerTextColor = computed(() => props.template?.header_text_color ?? '#ffffff')
const bodyTextColor   = computed(() => props.template?.body_text_color   ?? '#1e1b15')
const font            = computed(() => props.template?.font_family     ?? "'Inter', sans-serif")
const radius          = computed(() => props.template?.border_radius   ?? '8px')

const businessName    = computed(() => bpStore.profile?.name || 'My Business')
const businessLogo    = computed(() => bpStore.profile?.logo_url || '')
const businessAddress = computed(() => bpStore.profile?.address || '')
const businessEmail   = computed(() => bpStore.profile?.email || '')
const businessInitials = computed(() => {
  const name = bpStore.profile?.name || 'MB'
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
})

function formatDate(dateStr?: string) {
  if (!dateStr) return '—'
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}
</script>

<style scoped>
.po-preview {
  background: #fff;
  padding: 48px;
  border-radius: 8px;
  border: 1px solid #e5e5e5;
}

.po-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
}

.po-header-left {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.po-logo {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}
.po-logo img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.po-logo-fallback {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 18px;
  font-weight: 700;
  flex-shrink: 0;
}

.po-brand {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 4px;
  letter-spacing: -0.02em;
}

.po-brand-detail {
  font-size: 13px;
  color: #64748b;
  line-height: 1.6;
  margin: 0;
}

.po-header-right { text-align: right; }

.po-doc-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 4px;
  letter-spacing: -0.02em;
}

.po-doc-no {
  font-size: 13px;
  font-weight: 600;
  margin: 0 0 2px;
  letter-spacing: 0.05em;
}

.po-doc-date {
  font-size: 12px;
  color: #64748b;
  margin: 0;
  letter-spacing: 0.05em;
}

.po-divider {
  height: 2px;
  margin-bottom: 24px;
}

.po-parties {
  margin-bottom: 32px;
}

.po-party-label {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin: 0 0 8px;
}

.po-party-name {
  font-size: 16px;
  font-weight: 700;
  margin: 0;
}

.po-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 24px;
}

.po-table th {
  padding: 10px 12px;
  font-size: 12px;
  font-weight: 600;
  text-align: left;
  letter-spacing: 0.05em;
}

.po-table td {
  padding: 12px;
  font-size: 14px;
  border-bottom: 1px solid #f1f5f9;
}

.text-center { text-align: center; }
.text-right { text-align: right; }
.font-bold { font-weight: 700; }

.po-totals {
  border-top: 2px solid #e2e8f0;
  padding-top: 16px;
}

.po-total-row {
  display: flex;
  justify-content: flex-end;
  gap: 40px;
  margin-bottom: 8px;
  font-size: 14px;
  color: #64748b;
}

.po-grand-total {
  padding-top: 8px;
  border-top: 1px solid #e2e8f0;
  font-weight: 700;
  font-size: 18px;
}

.po-notes {
  margin-top: 24px;
  font-size: 13px;
  color: #64748b;
  line-height: 1.6;
}

.po-footer {
  margin-top: 32px;
  font-size: 11px;
  color: #94a3b8;
  border-top: 1px solid #e2e8f0;
  padding-top: 16px;
}
</style>
