<template>
  <div class="invoice-doc" :style="{ fontFamily: font }">
    <div class="inv-head">
      <div>
        <!-- Logo image or initials fallback -->
        <div class="inv-logo-wrap">
          <img
            v-if="businessLogo"
            :src="businessLogo"
            alt="logo"
            class="inv-logo-img"
            :style="{ borderRadius: radius }"
          />
          <div
            v-else
            class="inv-logo"
            :style="{ background: primary, borderRadius: radius }"
          >{{ getInitials(businessName) }}</div>
        </div>
        <div class="inv-company">{{ businessName }}</div>
      </div>
      <div style="text-align:right;">
        <div class="inv-badge" :style="{ background: primary, borderRadius: radius }">INVOICE</div>
        <div class="inv-number">{{ invoice.invoice_number }}</div>
        <div class="inv-date">{{ formatDate(invoice.issue_date ?? '') }}</div>
      </div>
    </div>
    <div class="inv-divider" :style="{ background: primary }" />
    <div class="inv-parties">
      <div>
        <div class="party-label">From</div>
        <div class="party-name">{{ businessName }}</div>
        <div class="party-detail" v-if="businessAddress">{{ businessAddress }}</div>
      </div>
      <div>
        <div class="party-label">Bill To</div>
        <div class="party-name">{{ invoice.client?.name ?? '—' }}</div>
        <div class="party-detail">{{ invoice.client?.address }}</div>
      </div>
    </div>
    <table class="inv-table">
      <colgroup>
        <col style="width: auto;" />
        <col style="width: 52px;" />
        <col style="width: 90px;" />
        <col style="width: 90px;" />
      </colgroup>
      <thead>
        <tr>
          <th :style="{ background: secondary }">Description</th>
          <th :style="{ background: secondary }" class="center">Qty</th>
          <th :style="{ background: secondary }" class="right">Rate</th>
          <th :style="{ background: secondary }" class="right">Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in invoice.line_items" :key="item.id">
          <td>{{ item.description }}</td>
          <td class="center">{{ item.quantity }}</td>
          <td class="right">{{ formatCurrency(item.unit_price, invoice.currency) }}</td>
          <td class="right">{{ formatCurrency(item.amount, invoice.currency) }}</td>
        </tr>
      </tbody>
    </table>
    <div class="inv-totals">
      <div class="total-row"><span>Subtotal</span><span>{{ formatCurrency(invoice.subtotal ?? 0, invoice.currency) }}</span></div>
      <div class="total-row"><span>Tax ({{ invoice.tax_rate }}%)</span><span>{{ formatCurrency(invoice.tax_amount ?? 0, invoice.currency) }}</span></div>
      <div class="total-row grand" :style="{ color: secondary }"><span>Total Due</span><span>{{ formatCurrency(invoice.total ?? 0, invoice.currency) }}</span></div>
    </div>
    <div class="inv-footer" v-if="invoice.notes">{{ invoice.notes }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Invoice, InvoiceTemplate } from '@/types'
import { useFormatters }           from '@/composables/useFormatters'
import { useBusinessProfileStore } from '@/stores/businessProfile'

const { formatCurrency, formatDate, getInitials } = useFormatters()

const props = defineProps<{ invoice: Partial<Invoice>; template?: InvoiceTemplate | null }>()

const bpStore = useBusinessProfileStore()

const primary   = computed(() => props.template?.primary_color   ?? '#c8f04a')
const secondary = computed(() => props.template?.secondary_color ?? '#0f0f0f')
const font      = computed(() => props.template?.font_family     ?? "'Syne', sans-serif")
const radius    = computed(() => props.template?.border_radius   ?? '4px')

const businessName    = computed(() => bpStore.profile.name    || 'My Business')
const businessLogo    = computed(() => bpStore.profile.logo_url || '')
const businessAddress = computed(() => bpStore.profile.address || '')
</script>

<style scoped>
.invoice-doc { background: white; color: #111; padding: 28px; font-size: 12px; border-radius: 8px; }
.inv-head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
.inv-logo-wrap { margin-bottom: 8px; }
.inv-logo-img { width: 52px; height: 52px; object-fit: contain; display: block; }
.inv-logo { width: 52px; height: 52px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 18px; color: #0f0f0f; }
.inv-company { font-weight: 700; font-size: 14px; }
.inv-badge { display: inline-block; padding: 4px 12px; font-size: 10px; font-weight: 800; letter-spacing: 2px; color: #0f0f0f; }
.inv-number { font-size: 20px; font-weight: 700; margin-top: 6px; }
.inv-date { font-size: 11px; color: #888; margin-top: 4px; }
.inv-divider { height: 2px; margin: 16px 0; border-radius: 2px; }
.inv-parties { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
.party-label { font-size: 9px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; color: #aaa; margin-bottom: 4px; }
.party-name { font-weight: 700; font-size: 13px; }
.party-detail { font-size: 11px; color: #777; margin-top: 2px; white-space: pre-line; }
.inv-table { width: 100%; border-collapse: collapse; margin-bottom: 16px; table-layout: fixed; }
.inv-table th { padding: 8px 10px; font-size: 9px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: white; }
.inv-table td { padding: 8px 10px; border-bottom: 1px solid #eee; }
.center { text-align: center !important; } .right { text-align: right !important; }
.inv-table th:first-child, .inv-table td:first-child { text-align: left; }
.inv-totals { margin-left: auto; width: 200px; }
.total-row { display: flex; justify-content: space-between; padding: 5px 0; font-size: 11px; color: #555; border-bottom: 1px solid #eee; }
.total-row.grand { font-weight: 800; font-size: 14px; border-top: 2px solid currentColor; border-bottom: none; margin-top: 4px; padding-top: 8px; }
.inv-footer { margin-top: 20px; padding-top: 12px; border-top: 1px solid #eee; font-size: 10px; color: #999; }
</style>
