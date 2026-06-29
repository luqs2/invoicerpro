<template>
  <div
    class="receipt-doc"
    :style="{ fontFamily: font }"
  >
    <!-- Header -->
    <div class="rcp-head">
      <div>
        <div class="rcp-logo-wrap">
          <img
            v-if="businessLogo"
            :src="businessLogo"
            alt="logo"
            class="rcp-logo-img"
            :style="{ borderRadius: radius }"
          >
          <div
            v-else
            class="rcp-logo"
            :style="{ background: primary, borderRadius: radius }"
          >
            {{ getInitials(businessName) }}
          </div>
        </div>
        <div class="rcp-company">
          {{ businessName }}
        </div>
      </div>
      <div style="text-align:right;">
        <div
          class="rcp-badge"
          :style="{ background: primary, borderRadius: radius }"
        >
          RECEIPT
        </div>
        <div class="rcp-number">
          {{ receipt.receipt_number }}
        </div>
        <div class="rcp-date">
          {{ formatDate(receipt.payment_date ?? '') }}
        </div>
      </div>
    </div>

    <div
      class="rcp-divider"
      :style="{ background: primary }"
    />

    <!-- Parties -->
    <div class="rcp-parties">
      <div>
        <div class="party-label">
          From
        </div>
        <div class="party-name">
          {{ businessName }}
        </div>
        <div
          v-if="businessAddress"
          class="party-detail"
        >
          {{ businessAddress }}
        </div>
      </div>
      <div>
        <div class="party-label">
          Received From
        </div>
        <div class="party-name">
          {{ receipt.client?.name ?? '—' }}
        </div>
        <div class="party-detail">
          {{ receipt.client?.address }}
        </div>
      </div>
    </div>

    <!-- Payment info box -->
    <div
      class="rcp-info-box"
      :style="{ borderColor: primary }"
    >
      <div class="info-row">
        <span class="info-label">Payment Method</span>
        <span class="info-value">{{ methodLabel(receipt.payment_method) }}</span>
      </div>
      <div
        v-if="receipt.invoice_number"
        class="info-row"
      >
        <span class="info-label">Invoice Reference</span>
        <span class="info-value">{{ receipt.invoice_number }}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Payment Date</span>
        <span class="info-value">{{ formatDate(receipt.payment_date ?? '') }}</span>
      </div>
    </div>

    <!-- Line items (if from invoice) -->
    <table
      v-if="receipt.line_items && receipt.line_items.length"
      class="rcp-table"
    >
      <colgroup>
        <col style="width: auto;">
        <col style="width: 52px;">
        <col style="width: 90px;">
        <col style="width: 90px;">
      </colgroup>
      <thead>
        <tr>
          <th :style="{ background: secondary }">
            Description
          </th>
          <th
            :style="{ background: secondary }"
            class="center"
          >
            Qty
          </th>
          <th
            :style="{ background: secondary }"
            class="right"
          >
            Rate
          </th>
          <th
            :style="{ background: secondary }"
            class="right"
          >
            Amount
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="item in receipt.line_items"
          :key="item.id"
        >
          <td>{{ item.description }}</td>
          <td class="center">
            {{ item.quantity }}
          </td>
          <td class="right">
            {{ formatCurrency(item.unit_price, receipt.currency) }}
          </td>
          <td class="right">
            {{ formatCurrency(item.amount, receipt.currency) }}
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Amount block -->
    <div class="rcp-totals">
      <div
        v-if="receipt.subtotal"
        class="total-row"
      >
        <span>Subtotal</span>
        <span>{{ formatCurrency(receipt.subtotal ?? 0, receipt.currency) }}</span>
      </div>
      <div
        v-if="receipt.tax_amount"
        class="total-row"
      >
        <span>Tax</span>
        <span>{{ formatCurrency(receipt.tax_amount ?? 0, receipt.currency) }}</span>
      </div>
      <div
        class="total-row grand"
        :style="{ color: secondary }"
      >
        <span>Amount Paid</span>
        <span>{{ formatCurrency(receipt.amount ?? 0, receipt.currency) }}</span>
      </div>
    </div>

    <!-- Paid stamp -->
    <div
      class="rcp-stamp"
      :style="{ borderColor: primary, color: primary }"
    >
      PAID
    </div>

    <!-- Notes -->
    <div
      v-if="receipt.notes"
      class="rcp-footer"
    >
      {{ receipt.notes }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { InvoiceTemplate, ReceiptPreviewData } from '@/types'
import { useFormatters }           from '@/composables/useFormatters'
import { useBusinessProfileStore } from '@/stores/businessProfile'

const { formatCurrency, formatDate, getInitials } = useFormatters()

const props = defineProps<{
  receipt: Partial<ReceiptPreviewData>
  template?: InvoiceTemplate | null
}>()

const bpStore = useBusinessProfileStore()

const primary   = computed(() => props.template?.primary_color   ?? '#c8f04a')
const secondary = computed(() => props.template?.secondary_color ?? '#0f0f0f')
const font      = computed(() => props.template?.font_family     ?? "'Syne', sans-serif")
const radius    = computed(() => props.template?.border_radius   ?? '4px')

const businessName    = computed(() => bpStore.profile.name    || 'My Business')
const businessLogo    = computed(() => bpStore.profile.logo_url || '')
const businessAddress = computed(() => bpStore.profile.address || '')

function methodLabel(m?: string) {
  const map: Record<string, string> = {
    bank_transfer: 'Bank Transfer',
    cash:          'Cash',
    online:        'Online Payment',
    card:          'Card',
    other:         'Other',
  }
  return m ? (map[m] ?? m) : '—'
}
</script>

<style scoped>
.receipt-doc { background: white; color: #111; padding: 28px; font-size: 12px; border-radius: 8px; }
.rcp-head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
.rcp-logo-wrap { margin-bottom: 8px; }
.rcp-logo-img { width: 52px; height: 52px; object-fit: contain; display: block; }
.rcp-logo { width: 52px; height: 52px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 18px; color: #0f0f0f; }
.rcp-company { font-weight: 700; font-size: 14px; }
.rcp-badge { display: inline-block; padding: 4px 12px; font-size: 10px; font-weight: 800; letter-spacing: 2px; color: #0f0f0f; }
.rcp-number { font-size: 20px; font-weight: 700; margin-top: 6px; }
.rcp-date { font-size: 11px; color: #888; margin-top: 4px; }
.rcp-divider { height: 2px; margin: 16px 0; border-radius: 2px; }
.rcp-parties { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
.party-label { font-size: 9px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; color: #aaa; margin-bottom: 4px; }
.party-name { font-weight: 700; font-size: 13px; }
.party-detail { font-size: 11px; color: #777; margin-top: 2px; white-space: pre-line; }
.rcp-info-box { border: 1.5px solid; border-radius: 8px; padding: 12px 16px; margin-bottom: 20px; display: flex; flex-direction: column; gap: 8px; }
.info-row { display: flex; justify-content: space-between; font-size: 12px; }
.info-label { color: #888; font-weight: 500; }
.info-value { font-weight: 700; color: #0f0f0f; }
.rcp-table { width: 100%; border-collapse: collapse; margin-bottom: 16px; table-layout: fixed; }
.rcp-table th { padding: 8px 10px; font-size: 9px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: white; }
.rcp-table td { padding: 8px 10px; border-bottom: 1px solid #eee; }
.center { text-align: center !important; } .right { text-align: right !important; }
.rcp-table th:first-child, .rcp-table td:first-child { text-align: left; }
.rcp-totals { margin-left: auto; width: 220px; }
.total-row { display: flex; justify-content: space-between; padding: 5px 0; font-size: 11px; color: #555; border-bottom: 1px solid #eee; }
.total-row.grand { font-weight: 800; font-size: 14px; border-top: 2px solid currentColor; border-bottom: none; margin-top: 4px; padding-top: 8px; }
.rcp-stamp { display: inline-block; border: 3px solid; border-radius: 6px; padding: 4px 14px; font-size: 22px; font-weight: 900; letter-spacing: 4px; transform: rotate(-12deg); opacity: 0.7; margin-top: 20px; }
.rcp-footer { margin-top: 20px; padding-top: 12px; border-top: 1px solid #eee; font-size: 10px; color: #999; }
</style>
