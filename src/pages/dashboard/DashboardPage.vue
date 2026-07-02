<template>
  <div class="page">
    <!-- Page header -->
    <div class="page-header">
      <div class="page-header-left">
        <p class="page-eyebrow">
          Good {{ timeOfDay }}
        </p>
        <h1 class="page-title">
          Dashboard
        </h1>
      </div>
      <div class="page-header-right">
        <router-link
          to="/app/invoices/new"
          class="btn-primary"
        >
          <Plus :size="16" />
          New Invoice
        </router-link>
      </div>
    </div>

    <!-- Stats row -->
    <div
      v-if="fetched"
      class="stats-row"
    >
      <div class="stat-card stat-revenue animate-in">
        <div class="stat-icon-wrap">
          <DollarSign :size="22" />
        </div>
        <div class="stat-body">
          <p class="stat-label">
            Total Revenue
          </p>
          <p class="stat-value">
            {{ formatCurrency(stats.total_revenue) }}
          </p>
          <p
            class="stat-trend"
            :class="trends.revenue >= 0 ? 'trend-up' : 'trend-down'"
          >
            <TrendingUp
              v-if="trends.revenue >= 0"
              :size="12"
            />
            <TrendingDown
              v-else
              :size="12"
            />
            {{ trends.revenue >= 0 ? '+' : '' }}{{ trends.revenue }}% vs last month
          </p>
        </div>
      </div>
      <div class="stat-card stat-sent animate-in">
        <div class="stat-icon-wrap">
          <FileText :size="22" />
        </div>
        <div class="stat-body">
          <p class="stat-label">
            Invoices Sent
          </p>
          <p class="stat-value">
            {{ stats.invoices_sent }}
          </p>
          <p
            class="stat-trend"
            :class="trends.sent >= 0 ? 'trend-up' : 'trend-down'"
          >
            <TrendingUp
              v-if="trends.sent >= 0"
              :size="12"
            />
            <TrendingDown
              v-else
              :size="12"
            />
            {{ trends.sent >= 0 ? '+' : '' }}{{ trends.sent }}% vs last month
          </p>
        </div>
      </div>
      <div class="stat-card stat-pending animate-in">
        <div class="stat-icon-wrap">
          <Clock :size="22" />
        </div>
        <div class="stat-body">
          <p class="stat-label">
            Awaiting Payment
          </p>
          <p class="stat-value">
            {{ formatCurrency(stats.pending_amount) }}
          </p>
          <p
            class="stat-trend"
            :class="trends.pending <= 0 ? 'trend-up' : 'trend-down'"
          >
            <TrendingUp
              v-if="trends.pending <= 0"
              :size="12"
            />
            <TrendingDown
              v-else
              :size="12"
            />
            {{ trends.pending >= 0 ? '+' : '' }}{{ trends.pending }}% vs last month
          </p>
        </div>
      </div>
      <div class="stat-card stat-overdue animate-in">
        <div class="stat-icon-wrap">
          <AlertCircle :size="22" />
        </div>
        <div class="stat-body">
          <p class="stat-label">
            Overdue
          </p>
          <p class="stat-value overdue">
            {{ formatCurrency(stats.overdue_amount) }}
          </p>
          <p
            class="stat-trend"
            :class="trends.overdue <= 0 ? 'trend-up' : 'trend-down'"
          >
            <TrendingUp
              v-if="trends.overdue <= 0"
              :size="12"
            />
            <TrendingDown
              v-else
              :size="12"
            />
            {{ trends.overdue >= 0 ? '+' : '' }}{{ trends.overdue }}% vs last month
          </p>
        </div>
      </div>
    </div>

    <!-- Stats skeleton -->
    <div
      v-else
      class="stats-row"
    >
      <div class="stat-card">
        <Skeleton
          variant="rect"
          width="44px"
          height="44px"
          style="border-radius:12px; flex-shrink:0;"
        />
        <div
          class="stat-body"
          style="flex:1;"
        >
          <Skeleton
            variant="text"
            width="80px"
          />
          <Skeleton
            variant="title"
            width="100px"
          />
        </div>
      </div>
      <div class="stat-card">
        <Skeleton
          variant="rect"
          width="44px"
          height="44px"
          style="border-radius:12px; flex-shrink:0;"
        />
        <div
          class="stat-body"
          style="flex:1;"
        >
          <Skeleton
            variant="text"
            width="80px"
          />
          <Skeleton
            variant="title"
            width="100px"
          />
        </div>
      </div>
      <div class="stat-card">
        <Skeleton
          variant="rect"
          width="44px"
          height="44px"
          style="border-radius:12px; flex-shrink:0;"
        />
        <div
          class="stat-body"
          style="flex:1;"
        >
          <Skeleton
            variant="text"
            width="80px"
          />
          <Skeleton
            variant="title"
            width="100px"
          />
        </div>
      </div>
      <div class="stat-card">
        <Skeleton
          variant="rect"
          width="44px"
          height="44px"
          style="border-radius:12px; flex-shrink:0;"
        />
        <div
          class="stat-body"
          style="flex:1;"
        >
          <Skeleton
            variant="text"
            width="80px"
          />
          <Skeleton
            variant="title"
            width="100px"
          />
        </div>
      </div>
    </div>

    <!-- Profile completion -->
    <div
      v-if="profileCompletion < 100"
      class="profile-banner"
    >
      <div class="profile-banner-text">
        <p class="profile-banner-title">
          Complete your profile
        </p>
        <p class="profile-banner-sub">
          Your profile is {{ profileCompletion }}% complete. A complete profile makes your invoices look professional.
        </p>
      </div>
      <div class="profile-banner-right">
        <div class="progress-ring">
          <svg viewBox="0 0 36 36">
            <path
              class="progress-bg"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              class="progress-fill"
              :stroke-dasharray="`${profileCompletion}, 100`"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <span class="progress-text">{{ profileCompletion }}%</span>
        </div>
        <router-link
          to="/app/settings"
          class="profile-link"
        >
          Complete now
          <ArrowRight :size="12" />
        </router-link>
      </div>
    </div>

    <!-- Quick actions -->
    <div
      v-if="fetched"
      class="quick-actions"
    >
      <router-link
        to="/app/invoices/new"
        class="qa-card animate-in"
      >
        <div class="qa-icon qa-icon-teal">
          <FilePlus :size="18" />
        </div>
        <div class="qa-content">
          <p class="qa-title">
            New Invoice
          </p>
          <p class="qa-sub">
            Create and send an invoice
          </p>
        </div>
        <ArrowRight
          :size="14"
          class="qa-arrow"
        />
      </router-link>
      <router-link
        to="/app/clients"
        class="qa-card animate-in"
      >
        <div class="qa-icon qa-icon-blue">
          <UserPlus :size="18" />
        </div>
        <div class="qa-content">
          <p class="qa-title">
            Add Client
          </p>
          <p class="qa-sub">
            Manage your clients
          </p>
        </div>
        <ArrowRight
          :size="14"
          class="qa-arrow"
        />
      </router-link>
      <router-link
        to="/app/receipts/new"
        class="qa-card animate-in"
      >
        <div class="qa-icon qa-icon-green">
          <Receipt :size="18" />
        </div>
        <div class="qa-content">
          <p class="qa-title">
            New Receipt
          </p>
          <p class="qa-sub">
            Record a payment
          </p>
        </div>
        <ArrowRight
          :size="14"
          class="qa-arrow"
        />
      </router-link>
    </div>

    <!-- Quick actions skeleton -->
    <div
      v-else
      class="quick-actions"
    >
      <div
        v-for="i in 3"
        :key="i"
        class="qa-card"
      >
        <Skeleton
          variant="rect"
          width="40px"
          height="40px"
          style="border-radius:10px; flex-shrink:0;"
        />
        <div
          class="qa-content"
          style="flex:1;"
        >
          <Skeleton
            variant="text"
            width="90px"
          />
          <Skeleton
            variant="text"
            width="140px"
          />
        </div>
      </div>
    </div>

    <!-- Recent invoices table -->
    <div class="section-card">
      <div class="section-head">
        <div class="section-head-left">
          <h2 class="section-title">
            Recent Invoices
          </h2>
          <span
            v-if="fetched && invoiceStore.invoices.length"
            class="section-count"
          >
            {{ invoiceStore.invoices.length }}
          </span>
        </div>
        <router-link
          to="/app/invoices"
          class="see-all-link"
        >
          View all
          <ArrowRight :size="14" />
        </router-link>
      </div>

      <div v-if="!fetched">
        <table class="data-table">
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Client</th>
              <th>Date</th>
              <th>Due Date</th>
              <th>Amount</th>
              <th>Status</th>
              <th class="th-action" />
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="i in 5"
              :key="i"
              class="table-row"
            >
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
              <td class="td-action" />
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else-if="invoiceStore.invoices.length">
        <table class="data-table">
          <caption class="sr-only">
            Recent invoices
          </caption>
          <thead>
            <tr>
              <th scope="col">
                Invoice #
              </th>
              <th scope="col">
                Client
              </th>
              <th scope="col">
                Date
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
                class="th-action"
              />
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="inv in invoiceStore.invoices.slice(0, 8)"
              :key="inv.id"
              class="table-row"
              @click="$router.push(`/app/invoices/${inv.id}`)"
            >
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
              <td class="td-action">
                <ChevronRight
                  :size="14"
                  class="row-arrow"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div
        v-else-if="!loading"
        class="empty-state"
      >
        <div class="empty-icon-wrap">
          <FileText :size="40" />
        </div>
        <p class="empty-title">
          No invoices yet
        </p>
        <p class="empty-sub">
          Create your first invoice to start tracking revenue.
        </p>
        <router-link
          to="/app/invoices/new"
          class="btn-primary"
          style="margin-top:8px;"
        >
          <Plus :size="14" />
          Create Invoice
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, computed } from 'vue'
import { DollarSign, FileText, Clock, AlertCircle, ArrowRight, TrendingUp, TrendingDown, FilePlus, UserPlus, Receipt, Plus, ChevronRight } from '@lucide/vue'
import { useInvoiceStore } from '@/stores/invoices'
import { useBusinessProfileStore } from '@/stores/businessProfile'
import { useFormatters } from '@/composables/useFormatters'
import { useMinDelay } from '@/composables/useMinDelay'
import Skeleton from '@/components/ui/Skeleton.vue'

const invoiceStore = useInvoiceStore()
const bpStore = useBusinessProfileStore()
const { formatCurrency, formatDate } = useFormatters()
const { loading: skeletonLoading, wrap } = useMinDelay()

const fetched = ref(false)

const stats = reactive({
  total_revenue:  0,
  invoices_sent:  0,
  pending_amount: 0,
  overdue_amount: 0,
})

const prevStats = reactive({
  total_revenue:  0,
  invoices_sent:  0,
  pending_amount: 0,
  overdue_amount: 0,
})

const trends = computed(() => {
  function pct(curr: number, prev: number) {
    if (prev === 0) return curr > 0 ? 100 : 0
    return Math.round(((curr - prev) / prev) * 100)
  }
  return {
    revenue: pct(stats.total_revenue, prevStats.total_revenue),
    sent:    pct(stats.invoices_sent, prevStats.invoices_sent),
    pending: pct(stats.pending_amount, prevStats.pending_amount),
    overdue: pct(stats.overdue_amount, prevStats.overdue_amount),
  }
})

const loading = computed(() => skeletonLoading.value || invoiceStore.loading)

const timeOfDay = computed(() => {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
})

const profileCompletion = computed(() => {
  const p = bpStore.profile
  const fields = [p.name, p.email, p.phone, p.address, p.logo_url]
  const filled = fields.filter(f => f && f.trim()).length
  return Math.round((filled / fields.length) * 100)
})

onMounted(async () => {
  await wrap(Promise.all([
    invoiceStore.fetchAll(),
    bpStore.fetch(),
  ]))

  const now = new Date()
  const thisMonth = now.getMonth()
  const thisYear = now.getFullYear()
  const prevMonth = thisMonth === 0 ? 11 : thisMonth - 1
  const prevYear  = thisMonth === 0 ? thisYear - 1 : thisYear

  for (const inv of invoiceStore.invoices) {
    const d = new Date(inv.issue_date)
    const m = d.getMonth()
    const y = d.getFullYear()
    const isThisMonth = m === thisMonth && y === thisYear
    const isPrevMonth = m === prevMonth && y === prevYear

    if (isThisMonth) {
      stats.invoices_sent++
      if (inv.status === 'paid')    stats.total_revenue  += inv.total
      if (inv.status === 'sent')    stats.pending_amount += inv.total
      if (inv.status === 'overdue') stats.overdue_amount += inv.total
    }
    if (isPrevMonth) {
      prevStats.invoices_sent++
      if (inv.status === 'paid')    prevStats.total_revenue  += inv.total
      if (inv.status === 'sent')    prevStats.pending_amount += inv.total
      if (inv.status === 'overdue') prevStats.overdue_amount += inv.total
    }
  }
  fetched.value = true
})
</script>

<style scoped>
/* Stagger delays for stats cards */
.stat-card:nth-child(1) { animation-delay: 0ms; }
.stat-card:nth-child(2) { animation-delay: 60ms; }
.stat-card:nth-child(3) { animation-delay: 120ms; }
.stat-card:nth-child(4) { animation-delay: 180ms; }

/* Stagger delays for quick actions */
.qa-card:nth-child(1) { animation-delay: 0ms; }
.qa-card:nth-child(2) { animation-delay: 50ms; }
.qa-card:nth-child(3) { animation-delay: 100ms; }

/* Profile banner entrance */
.profile-banner {
  animation: fadeSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both;
}

.page { gap: 24px; }

/* Paper & Ink heading font */
.page-title,
.section-title,
.qa-title,
.stat-value,
.profile-banner-title,
.empty-title {
  font-family: 'Merriweather', serif;
}

.page-eyebrow {
  font-size: 13px;
  color: #414846;
  margin: 0 0 4px;
  text-transform: capitalize;
  font-weight: 500;
}

/* Stats */
.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.stat-card {
  background: #F7F4EC;
  border: 1px solid #D6D0C2;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: flex-start;
  gap: 14px;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.dark .stat-card { background: #1d201f; border-color: #404945; }

.stat-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,.08); transform: translateY(-1px); }

.stat-icon-wrap {
  width: 44px;
  height: 44px;
  min-width: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.stat-revenue .stat-icon-wrap  { background: #cbe9e0; color: #08241f; }
.stat-sent .stat-icon-wrap     { background: #e0f2fe; color: #0284c7; }
.stat-pending .stat-icon-wrap  { background: #fef3c7; color: #d97706; }
.stat-overdue .stat-icon-wrap  { background: #fef2f2; color: #dc2626; }

.stat-body { flex: 1; min-width: 0; }

.stat-label {
  font-size: 11px;
  font-weight: 600;
  color: #414846;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 4px;
}

.stat-value {
  font-size: 22px;
  font-weight: 700;
  font-family: 'Merriweather', serif;
  color: #1e1b15;
  margin: 0;
  letter-spacing: -0.4px;
  font-variant-numeric: tabular-nums;
  line-height: 1.2;
}
.dark .stat-value { color: #e1e3e1; }

.stat-value.overdue { color: #dc2626; }

.stat-trend {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 11px;
  font-weight: 600;
  margin: 6px 0 0;
  padding: 2px 6px;
  border-radius: 4px;
}
.trend-up   { color: #16a34a; background: #f0fdf4; }
.trend-down { color: #dc2626; background: #fef2f2; }

/* Quick actions */
.quick-actions {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.qa-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 18px;
  background: #F7F4EC;
  border: 1px solid #D6D0C2;
  border-radius: 14px;
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.dark .qa-card { background: #1d201f; border-color: #404945; }
.qa-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,.08); border-color: #08241f; transform: translateY(-1px); }

.qa-icon {
  width: 40px;
  height: 40px;
  min-width: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.qa-icon-teal   { background: #cbe9e0; color: #08241f; }
.qa-icon-blue   { background: #e0f2fe; color: #0284c7; }
.qa-icon-green  { background: #dcfce7; color: #16a34a; }

.qa-content { flex: 1; min-width: 0; }

.qa-title {
  font-size: 14px;
  font-weight: 700;
  color: #1e1b15;
  margin: 0 0 2px;
}
.dark .qa-title { color: #e1e3e1; }

.qa-sub {
  font-size: 12px;
  color: #414846;
  margin: 0;
}

.qa-arrow {
  color: #414846;
  transition: color .15s, transform .15s;
  flex-shrink: 0;
}
.qa-card:hover .qa-arrow { color: #08241f; transform: translateX(2px); }

/* Profile completion */
.profile-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 16px 20px;
  background: #EDE8DE;
  border: 1px solid #cbe9e0;
  border-radius: 14px;
}

.profile-banner-title {
  font-size: 14px;
  font-weight: 700;
  color: #1e1b15;
  margin: 0 0 4px;
}

.profile-banner-sub {
  font-size: 13px;
  color: #414846;
  margin: 0;
}

.profile-banner-right {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-shrink: 0;
}

.progress-ring {
  width: 44px;
  height: 44px;
  position: relative;
}

.progress-ring svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.progress-bg {
  fill: none;
  stroke: #D6D0C2;
  stroke-width: 3;
}

.progress-fill {
  fill: none;
  stroke: #08241f;
  stroke-width: 3;
  stroke-linecap: round;
  transition: stroke-dasharray .4s ease;
}

.progress-text {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  color: #08241f;
}

.profile-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  font-weight: 600;
  color: #08241f;
  text-decoration: none;
  white-space: nowrap;
  transition: gap .15s;
}
.profile-link:hover { text-decoration: underline; gap: 6px; }

/* Dashboard-specific empty icon wrap */
.empty-icon-wrap {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: #EDE8DE;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #414846;
  margin-bottom: 8px;
}
.dark .empty-icon-wrap { background: #404945; color: #6b7a74; }

/* Dashboard-specific table overrides */
.data-table th {
  padding: 10px 16px 10px 24px;
  letter-spacing: 0.6px;
}
.data-table td {
  padding: 14px 16px 14px 24px;
}

/* Responsive */
@media (max-width: 1024px) {
  .stats-row { grid-template-columns: repeat(2, 1fr); }
  .quick-actions { grid-template-columns: repeat(3, 1fr); }
}

@media (max-width: 768px) {
  .page { padding: 20px 16px; gap: 20px; }
  .page-title { font-size: 20px; }
  .stats-row { grid-template-columns: 1fr 1fr; gap: 12px; }
  .stat-card { padding: 14px; gap: 10px; }
  .stat-value { font-size: 18px; }
  .quick-actions { grid-template-columns: 1fr; }
  .data-table th:nth-child(3),
  .data-table th:nth-child(4),
  .data-table td:nth-child(3),
  .data-table td:nth-child(4) { display: none; }
  .th-action, .td-action { display: none; }
  .profile-banner { flex-direction: column; align-items: stretch; gap: 12px; }
  .profile-banner-right { justify-content: space-between; }
}
</style>
