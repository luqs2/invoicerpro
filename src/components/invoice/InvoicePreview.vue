<template>
  <div class="invoice-doc" :style="{ fontFamily: font }">

    <!-- LAYOUT: classic — logo stacked above name, badge+number right -->
    <template v-if="headerLayout === 'classic' || !headerLayout">
      <div class="inv-head inv-head--classic">
        <div class="inv-head-brand">
          <div class="inv-logo-wrap">
            <img v-if="businessLogo" :src="businessLogo" alt="logo" class="inv-logo-img" :style="{ borderRadius: radius }" />
            <div v-else class="inv-logo" :style="{ background: primary, borderRadius: radius }">{{ getInitials(businessName) }}</div>
          </div>
          <div class="inv-company" :style="{ fontSize: companyFontSize + 'px' }">{{ businessName }}</div>
        </div>
        <div style="text-align:right;">
          <div class="inv-badge" :style="{ background: primary, borderRadius: radius }">INVOICE</div>
          <div class="inv-number">{{ invoice.invoice_number }}</div>
          <div class="inv-date">{{ formatDate(invoice.issue_date ?? '') }}</div>
        </div>
      </div>
      <div class="inv-divider" :style="{ background: primary }" />
    </template>

    <!-- LAYOUT: inline — logo + company name side by side on left -->
    <template v-else-if="headerLayout === 'inline'">
      <div class="inv-head inv-head--inline">
        <div class="inv-head-brand inv-head-brand--inline">
          <div class="inv-logo-wrap inv-logo-wrap--inline">
            <img v-if="businessLogo" :src="businessLogo" alt="logo" class="inv-logo-img inv-logo-img--inline" :style="{ borderRadius: radius }" />
            <div v-else class="inv-logo inv-logo--inline" :style="{ background: primary, borderRadius: radius }">{{ getInitials(businessName) }}</div>
          </div>
          <div class="inv-company inv-company--inline" :style="{ fontSize: companyFontSize + 'px' }">{{ businessName }}</div>
        </div>
        <div style="text-align:right;">
          <div class="inv-badge" :style="{ background: primary, borderRadius: radius }">INVOICE</div>
          <div class="inv-number">{{ invoice.invoice_number }}</div>
          <div class="inv-date">{{ formatDate(invoice.issue_date ?? '') }}</div>
        </div>
      </div>
      <div class="inv-divider" :style="{ background: primary }" />
    </template>

    <!-- LAYOUT: centered — logo + name centered, invoice info below -->
    <template v-else-if="headerLayout === 'centered'">
      <div class="inv-head inv-head--centered">
        <div class="inv-logo-wrap">
          <img v-if="businessLogo" :src="businessLogo" alt="logo" class="inv-logo-img inv-logo-img--lg" :style="{ borderRadius: radius }" />
          <div v-else class="inv-logo inv-logo--lg" :style="{ background: primary, borderRadius: radius }">{{ getInitials(businessName) }}</div>
        </div>
        <div class="inv-company inv-company--lg" :style="{ fontSize: companyFontSize + 'px' }">{{ businessName }}</div>
        <div class="inv-head-meta-centered">
          <div class="inv-badge" :style="{ background: primary, borderRadius: radius }">INVOICE</div>
          <div class="inv-number">{{ invoice.invoice_number }}</div>
          <div class="inv-date">{{ formatDate(invoice.issue_date ?? '') }}</div>
        </div>
      </div>
      <div class="inv-divider" :style="{ background: primary }" />
    </template>

    <!-- LAYOUT: minimal — text only, thin rule -->
    <template v-else-if="headerLayout === 'minimal'">
      <div class="inv-head inv-head--minimal">
        <div>
          <div class="inv-company inv-company--minimal" :style="{ fontSize: companyFontSize + 'px' }">{{ businessName }}</div>
          <div class="inv-date" style="margin-top:2px;">{{ formatDate(invoice.issue_date ?? '') }}</div>
        </div>
        <div style="text-align:right;">
          <div class="inv-number inv-number--minimal" :style="{ color: primary }">{{ invoice.invoice_number }}</div>
          <div class="inv-badge inv-badge--minimal" :style="{ color: primary }">INVOICE</div>
        </div>
      </div>
      <div class="inv-divider inv-divider--thin" :style="{ background: primary }" />
    </template>

    <!-- LAYOUT: bold — full-width colour banner -->
    <template v-else-if="headerLayout === 'bold'">
      <div class="inv-head inv-head--bold" :style="{ background: secondary }">
        <div class="inv-head-brand inv-head-brand--inline">
          <div class="inv-logo-wrap inv-logo-wrap--inline">
            <img v-if="businessLogo" :src="businessLogo" alt="logo" class="inv-logo-img inv-logo-img--bold" :style="{ borderRadius: radius }" />
            <div v-else class="inv-logo inv-logo--bold" :style="{ background: primary, borderRadius: radius }">{{ getInitials(businessName) }}</div>
          </div>
          <div class="inv-company inv-company--bold" :style="{ fontSize: companyFontSize + 'px' }">{{ businessName }}</div>
        </div>
        <div style="text-align:right;">
          <div class="inv-badge inv-badge--bold" :style="{ background: primary, borderRadius: radius }">INVOICE</div>
          <div class="inv-number inv-number--bold">{{ invoice.invoice_number }}</div>
          <div class="inv-date inv-date--bold">{{ formatDate(invoice.issue_date ?? '') }}</div>
        </div>
      </div>
    </template>

    <!-- LAYOUT: split — left accent sidebar strip -->
    <template v-else-if="headerLayout === 'split'">
      <div class="inv-head inv-head--split">
        <div class="inv-head-split-bar" :style="{ background: primary }" />
        <div class="inv-head-split-content">
          <div class="inv-head-brand inv-head-brand--inline">
            <div class="inv-logo-wrap inv-logo-wrap--inline">
              <img v-if="businessLogo" :src="businessLogo" alt="logo" class="inv-logo-img" :style="{ borderRadius: radius }" />
              <div v-else class="inv-logo" :style="{ background: primary, borderRadius: radius }">{{ getInitials(businessName) }}</div>
            </div>
            <div class="inv-company" :style="{ fontSize: companyFontSize + 'px' }">{{ businessName }}</div>
          </div>
          <div style="text-align:right;">
            <div class="inv-badge" :style="{ background: secondary, borderRadius: radius }">INVOICE</div>
            <div class="inv-number">{{ invoice.invoice_number }}</div>
            <div class="inv-date">{{ formatDate(invoice.issue_date ?? '') }}</div>
          </div>
        </div>
      </div>
      <div class="inv-divider" :style="{ background: secondary, opacity: 0.15 }" />
    </template>

    <!-- Parties -->
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

    <!-- Line items -->
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

    <!-- Totals -->
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

const primary         = computed(() => props.template?.primary_color   ?? '#c8f04a')
const secondary       = computed(() => props.template?.secondary_color ?? '#0f0f0f')
const font            = computed(() => props.template?.font_family     ?? "'Syne', sans-serif")
const radius          = computed(() => props.template?.border_radius   ?? '4px')
const headerLayout    = computed(() => (props.template as any)?.header_layout    ?? 'classic')
const companyFontSize = computed(() => (props.template as any)?.company_font_size ?? 14)

const businessName    = computed(() => bpStore.profile.name    || 'My Business')
const businessLogo    = computed(() => bpStore.profile.logo_url || '')
const businessAddress = computed(() => bpStore.profile.address || '')
</script>

<style scoped>
.invoice-doc { background: white; color: #111; padding: 28px; font-size: 12px; border-radius: 8px; }

/* ── Classic ── */
.inv-head--classic { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
.inv-head-brand    { display: flex; flex-direction: column; }

/* ── Inline ── */
.inv-head--inline  { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.inv-head-brand--inline { display: flex; flex-direction: row; align-items: center; gap: 12px; }
.inv-logo-wrap--inline  { margin-bottom: 0; }
.inv-logo-img--inline   { width: 40px; height: 40px; }
.inv-logo--inline       { width: 40px; height: 40px; font-size: 14px; }
.inv-company--inline    { font-weight: 700; }

/* ── Centered ── */
.inv-head--centered {
  display: flex; flex-direction: column; align-items: center;
  text-align: center; margin-bottom: 20px; gap: 6px;
}
.inv-head-meta-centered { display: flex; flex-direction: column; align-items: center; gap: 2px; margin-top: 4px; }

/* ── Minimal ── */
.inv-head--minimal { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 12px; }

/* ── Bold ── */
.inv-head--bold {
  display: flex; justify-content: space-between; align-items: center;
  padding: 20px 24px; margin: -28px -28px 20px; border-radius: 8px 8px 0 0;
}

/* ── Split ── */
.inv-head--split   { display: flex; align-items: stretch; margin: -28px -28px 0; }
.inv-head-split-bar{ width: 6px; flex-shrink: 0; border-radius: 8px 0 0 0; }
.inv-head-split-content {
  flex: 1; display: flex; justify-content: space-between; align-items: center;
  padding: 20px 24px 20px 18px;
}

/* ── Logo variants ── */
.inv-logo-wrap     { margin-bottom: 8px; }
.inv-logo-img      { width: 52px; height: 52px; object-fit: contain; display: block; }
.inv-logo-img--lg  { width: 64px; height: 64px; }
.inv-logo-img--bold{ width: 44px; height: 44px; }

.inv-logo       { width: 52px; height: 52px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 18px; color: #0f0f0f; }
.inv-logo--lg   { width: 64px; height: 64px; font-size: 22px; }
.inv-logo--bold { width: 44px; height: 44px; font-size: 16px; }

/* ── Company name variants ── */
.inv-company         { font-weight: 700; font-size: 14px; }
.inv-company--lg     { font-weight: 800; }
.inv-company--minimal{ font-weight: 800; }
.inv-company--bold   { font-weight: 700; color: rgba(255,255,255,0.9); }

/* ── Badge variants ── */
.inv-badge          { display: inline-block; padding: 4px 12px; font-size: 10px; font-weight: 800; letter-spacing: 2px; color: #0f0f0f; }
.inv-badge--minimal { background: none !important; padding: 0; font-size: 9px; font-weight: 700; letter-spacing: 2px; }
.inv-badge--bold    { color: #0f0f0f; }

/* ── Number variants ── */
.inv-number          { font-size: 20px; font-weight: 700; margin-top: 6px; }
.inv-number--minimal { font-size: 18px; font-weight: 800; margin-top: 0; }
.inv-number--bold    { font-size: 18px; font-weight: 700; color: rgba(255,255,255,0.95); margin-top: 4px; }

/* ── Date variants ── */
.inv-date       { font-size: 11px; color: #888; margin-top: 4px; }
.inv-date--bold { color: rgba(255,255,255,0.6); font-size: 10px; margin-top: 2px; }

/* ── Dividers ── */
.inv-divider       { height: 2px; margin: 16px 0; border-radius: 2px; }
.inv-divider--thin { height: 1px; margin: 10px 0; opacity: 0.4; }

/* ── Shared sections ── */
.inv-parties { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
.party-label { font-size: 9px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; color: #aaa; margin-bottom: 4px; }
.party-name  { font-weight: 700; font-size: 13px; }
.party-detail{ font-size: 11px; color: #777; margin-top: 2px; white-space: pre-line; }

.inv-table { width: 100%; border-collapse: collapse; margin-bottom: 16px; table-layout: fixed; }
.inv-table th { padding: 8px 10px; font-size: 9px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: white; }
.inv-table td { padding: 8px 10px; border-bottom: 1px solid #eee; }
.center { text-align: center !important; }
.right  { text-align: right !important; }
.inv-table th:first-child, .inv-table td:first-child { text-align: left; }

.inv-totals  { margin-left: auto; width: 200px; }
.total-row   { display: flex; justify-content: space-between; padding: 5px 0; font-size: 11px; color: #555; border-bottom: 1px solid #eee; }
.total-row.grand { font-weight: 800; font-size: 14px; border-top: 2px solid currentColor; border-bottom: none; margin-top: 4px; padding-top: 8px; }

.inv-footer { margin-top: 20px; padding-top: 12px; border-top: 1px solid #eee; font-size: 10px; color: #999; }
</style>