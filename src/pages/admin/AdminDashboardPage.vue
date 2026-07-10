<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Users, FileText, DollarSign, Receipt } from '@lucide/vue'
import AdminStatCard from '@/components/admin/AdminStatCard.vue'
import AdminLineChart from '@/components/admin/AdminLineChart.vue'
import AdminBarChart from '@/components/admin/AdminBarChart.vue'
import AdminDoughnutChart from '@/components/admin/AdminDoughnutChart.vue'
import Badge from '@/components/ui/Badge.vue'
import {
  getGlobalStats, getUserGrowth, getAllUsers,
  getInvoiceStats, getReceiptStats, getPOStats,
} from '@/services/admin'
import { useBreakpoint } from '@/composables/useBreakpoint'
import type { AdminGlobalStats, MonthlyData, UserWithStats } from '@/types'

const { isMobile } = useBreakpoint()

const router = useRouter()
const loading = ref(true)

const stats = ref<AdminGlobalStats>({
  total_users: 0,
  total_invoices: 0,
  total_receipts: 0,
  total_purchase_orders: 0,
  total_revenue: 0,
  users_trend: 0,
  invoices_trend: 0,
  revenue_trend: 0,
  receipts_trend: 0,
})

const userGrowth = ref<MonthlyData[]>([])
const recentUsers = ref<UserWithStats[]>([])
const invoiceStats = ref<any>(null)
const receiptStats = ref<any>(null)
const poStats = ref<any>(null)

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR', maximumFractionDigits: 0 }).format(val)
}

const formatMonth = (m: string) => {
  const [year, month] = m.split('-')
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${months[parseInt(month) - 1]} ${year.slice(2)}`
}

const revenueChartData = computed(() => ({
  labels: userGrowth.value.map(d => formatMonth(d.month)),
  datasets: [{
    label: 'New Users',
    data: userGrowth.value.map(d => d.count),
    borderColor: '#08241f',
    backgroundColor: 'rgba(8, 36, 31, 0.1)',
  }],
}))

const invoiceTrendData = computed(() => {
  if (!invoiceStats.value) return { labels: [], datasets: [] }
  return {
    labels: invoiceStats.value.monthly_trend.map((d: any) => formatMonth(d.month)),
    datasets: [{
      label: 'Invoices Created',
      data: invoiceStats.value.monthly_trend.map((d: any) => d.count),
      borderColor: '#B5652D',
      backgroundColor: 'rgba(181, 101, 45, 0.1)',
    }],
  }
})

const revenueTrendData = computed(() => {
  if (!invoiceStats.value) return { labels: [], datasets: [] }
  return {
    labels: invoiceStats.value.monthly_trend.map((d: any) => formatMonth(d.month)),
    datasets: [
      {
        label: 'Invoice Revenue',
        data: invoiceStats.value.monthly_trend.map((d: any) => d.revenue || 0),
        backgroundColor: '#B5652D',
        borderRadius: 6,
      },
      {
        label: 'Receipt Revenue',
        data: receiptStats.value?.monthly_trend?.map((d: any) => d.revenue || 0) || [],
        backgroundColor: '#08241f',
        borderRadius: 6,
      },
    ],
  }
})

const invoiceStatusData = computed(() => {
  if (!invoiceStats.value) return { labels: [], data: [], colors: [] }
  const statusColors: Record<string, string> = {
    draft: '#64748b',
    sent: '#0ea5e9',
    paid: '#16a34a',
    overdue: '#dc2626',
    cancelled: '#d97706',
  }
  return {
    labels: invoiceStats.value.status_breakdown.map((s: any) => s.status.charAt(0).toUpperCase() + s.status.slice(1)),
    data: invoiceStats.value.status_breakdown.map((s: any) => s.count),
    colors: invoiceStats.value.status_breakdown.map((s: any) => statusColors[s.status] || '#64748b'),
  }
})

const roleBadgeClass = (role?: string): 'default' | 'sent' | 'warning' | 'danger' => {
  if (role === 'super_admin') return 'danger'
  if (role === 'admin') return 'warning'
  if (role === 'viewer') return 'sent'
  return 'default'
}

onMounted(async () => {
  try {
    const [statsData, growthData, usersData, invStats, recStats, poData] = await Promise.all([
      getGlobalStats(),
      getUserGrowth(),
      getAllUsers({ page: 1, limit: 10 }),
      getInvoiceStats(),
      getReceiptStats(),
      getPOStats(),
    ])
    stats.value = statsData
    userGrowth.value = growthData
    recentUsers.value = usersData.data
    invoiceStats.value = invStats
    receiptStats.value = recStats
    poStats.value = poData
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Admin Dashboard</h1>
        <p class="page-sub">Platform overview</p>
      </div>
    </div>

    <!-- Loading skeleton -->
    <template v-if="loading">
      <div class="stats-grid">
        <div v-for="i in 4" :key="i" class="admin-stat-card skeleton-card">
          <div class="skeleton skeleton-icon" />
          <div class="skeleton-content">
            <div class="skeleton skeleton-text" />
            <div class="skeleton skeleton-text-lg" />
          </div>
        </div>
      </div>
      <div class="charts-grid">
        <div v-for="i in 4" :key="i" class="section-card">
          <div class="skeleton skeleton-text" style="width: 120px; height: 16px;" />
          <div class="skeleton" style="width: 100%; height: 240px; border-radius: 8px;" />
        </div>
      </div>
    </template>

    <template v-else>
      <!-- Stats row -->
      <div class="stats-grid">
        <AdminStatCard
          :icon="Users"
          label="Total Users"
          :value="stats.total_users"
          :trend="stats.users_trend"
          color="#08241f"
        />
        <AdminStatCard
          :icon="FileText"
          label="Total Invoices"
          :value="stats.total_invoices"
          :trend="stats.invoices_trend"
          color="#B5652D"
        />
        <AdminStatCard
          :icon="DollarSign"
          label="Total Revenue"
          :value="formatCurrency(stats.total_revenue)"
          :trend="stats.revenue_trend"
          color="#16a34a"
        />
        <AdminStatCard
          :icon="Receipt"
          label="Total Receipts"
          :value="stats.total_receipts"
          :trend="stats.receipts_trend"
          color="#0ea5e9"
        />
      </div>

      <!-- Charts row 1 -->
      <div class="charts-grid">
        <div class="section-card">
          <h3 class="chart-title">Invoice Trend</h3>
          <AdminLineChart
            v-if="invoiceTrendData.labels.length"
            :labels="invoiceTrendData.labels"
            :datasets="invoiceTrendData.datasets"
            :height="260"
          />
        </div>
        <div class="section-card">
          <h3 class="chart-title">User Growth</h3>
          <AdminLineChart
            v-if="revenueChartData.labels.length"
            :labels="revenueChartData.labels"
            :datasets="revenueChartData.datasets"
            :height="260"
          />
        </div>
      </div>

      <!-- Charts row 2 -->
      <div class="charts-grid">
        <div class="section-card">
          <h3 class="chart-title">Invoice Status</h3>
          <AdminDoughnutChart
            v-if="invoiceStatusData.labels.length"
            :labels="invoiceStatusData.labels"
            :data="invoiceStatusData.data"
            :colors="invoiceStatusData.colors"
            :height="260"
          />
        </div>
        <div class="section-card">
          <h3 class="chart-title">Revenue by Month</h3>
          <AdminBarChart
            v-if="revenueTrendData.labels.length"
            :labels="revenueTrendData.labels"
            :datasets="revenueTrendData.datasets"
            :height="260"
          />
        </div>
      </div>

      <!-- Recent users -->
      <div class="section-card">
        <div class="section-header">
          <h3 class="section-title">Recent Users</h3>
          <router-link to="/app/admin/users" class="view-all-link">View all</router-link>
        </div>

        <!-- Desktop table -->
        <table v-if="!isMobile" class="data-table">
          <thead>
            <tr>
              <th scope="col">User</th>
              <th scope="col">Role</th>
              <th scope="col">Invoices</th>
              <th scope="col">Revenue</th>
              <th scope="col">Joined</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="user in recentUsers"
              :key="user.id"
              class="table-row"
              @click="router.push(`/app/admin/users/${user.id}`)"
            >
              <td class="td-client">
                <div class="user-avatar">
                  {{ user.full_name?.charAt(0)?.toUpperCase() || '?' }}
                </div>
                <div>
                  <div class="td-bold">{{ user.full_name || 'Unnamed' }}</div>
                  <div class="td-muted">{{ user.business_name || 'No business' }}</div>
                </div>
              </td>
              <td>
                <Badge :variant="roleBadgeClass(user.role)">
                  {{ user.role || 'user' }}
                </Badge>
              </td>
              <td class="td-mono">{{ user.invoice_count }}</td>
              <td class="td-mono td-bold">{{ formatCurrency(user.total_revenue) }}</td>
              <td class="td-muted">{{ user.created_at ? new Date(user.created_at).toLocaleDateString() : '-' }}</td>
            </tr>
          </tbody>
        </table>

        <!-- Mobile cards -->
        <div v-else class="card-list">
          <div
            v-for="user in recentUsers"
            :key="user.id"
            class="user-card"
            @click="router.push(`/app/admin/users/${user.id}`)"
          >
            <div class="user-card-header">
              <div class="user-avatar">
                {{ user.full_name?.charAt(0)?.toUpperCase() || '?' }}
              </div>
              <div class="user-card-info">
                <div class="user-card-name">{{ user.full_name || 'Unnamed' }}</div>
                <div class="user-card-business">{{ user.business_name || 'No business' }}</div>
              </div>
              <Badge :variant="roleBadgeClass(user.role)">{{ user.role || 'user' }}</Badge>
            </div>
            <div class="user-card-stats">
              <div class="user-card-stat">
                <span class="user-card-stat-label">Invoices</span>
                <span class="user-card-stat-value">{{ user.invoice_count }}</span>
              </div>
              <div class="user-card-stat">
                <span class="user-card-stat-label">Revenue</span>
                <span class="user-card-stat-value">{{ formatCurrency(user.total_revenue) }}</span>
              </div>
              <div class="user-card-stat">
                <span class="user-card-stat-label">Joined</span>
                <span class="user-card-stat-value">{{ user.created_at ? new Date(user.created_at).toLocaleDateString() : '-' }}</span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="recentUsers.length === 0" class="empty-state">
          <Users :size="40" class="empty-icon" />
          <p>No users yet</p>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.page {
  padding: 24px;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 24px;
}

.page-title {
  font-family: 'Merriweather', Georgia, serif;
  font-size: 24px;
  font-weight: 700;
  color: #1e1b15;
  margin: 0;
}
.dark .page-title { color: #e1e3e1; }

.page-sub {
  font-size: 14px;
  color: #414846;
  margin: 4px 0 0;
}
.dark .page-sub { color: #c0c8c4; }

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.section-card {
  background: #F7F4EC;
  border: 1px solid #D6D0C2;
  border-radius: 12px;
  padding: 20px;
}
.dark .section-card { background: #1d201f; border-color: #404945; }

.chart-title {
  font-size: 14px;
  font-weight: 600;
  color: #1e1b15;
  margin: 0 0 16px;
}
.dark .chart-title { color: #e1e3e1; }

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #1e1b15;
  margin: 0;
}
.dark .section-title { color: #e1e3e1; }

.view-all-link {
  font-size: 13px;
  color: #B5652D;
  text-decoration: none;
  font-weight: 500;
}
.view-all-link:hover { text-decoration: underline; }

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  text-align: left;
  font-size: 12px;
  font-weight: 600;
  color: #414846;
  padding: 8px 12px;
  border-bottom: 1px solid #D6D0C2;
}
.dark .data-table th { color: #c0c8c4; border-color: #404945; }

.data-table td {
  padding: 10px 12px;
  font-size: 14px;
  color: #1e1b15;
  border-bottom: 1px solid #D6D0C2;
}
.dark .data-table td { color: #e1e3e1; border-color: #404945; }

.table-row { cursor: pointer; transition: background 0.12s; }
.table-row:hover { background: #EDE8DE; }
.dark .table-row:hover { background: #323534; }

.td-client {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #08241f;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
  flex-shrink: 0;
}

.td-bold { font-weight: 600; }
.td-muted { font-size: 12px; color: #414846; }
.dark .td-muted { color: #c0c8c4; }
.td-mono { font-family: 'JetBrains Mono', monospace; }

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #414846;
}
.dark .empty-state { color: #c0c8c4; }

.empty-icon { opacity: 0.4; margin-bottom: 8px; }

/* Skeleton */
.skeleton-card {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.skeleton {
  background: linear-gradient(90deg, #EDE8DE 25%, #D6D0C2 50%, #EDE8DE 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 6px;
}
.dark .skeleton {
  background: linear-gradient(90deg, #323534 25%, #404945 50%, #323534 75%);
  background-size: 200% 100%;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.skeleton-icon { width: 44px; height: 44px; border-radius: 10px; flex-shrink: 0; }
.skeleton-content { flex: 1; }
.skeleton-text { width: 80px; height: 14px; margin-bottom: 8px; }
.skeleton-text-lg { width: 120px; height: 24px; }

@media (max-width: 1024px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .charts-grid { grid-template-columns: 1fr; }
}

@media (max-width: 640px) {
  .stats-grid { grid-template-columns: 1fr; }
  .page { padding: 16px; }
}

/* Mobile card list */
.card-list { display: flex; flex-direction: column; gap: 12px; }

.user-card {
  background: #F7F4EC; border: 1px solid #D6D0C2; border-radius: 14px;
  padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,.05); cursor: pointer;
  transition: box-shadow .15s;
}
.user-card:hover { box-shadow: 0 2px 8px rgba(0,0,0,.1); }
.dark .user-card { background: #1d201f; border-color: rgba(255,255,255,.05); }

.user-card-header {
  display: flex; align-items: center; gap: 12px; margin-bottom: 12px;
}

.user-card-info { flex: 1; min-width: 0; }

.user-card-name {
  font-size: 15px; font-weight: 700; color: #1e1b15;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.dark .user-card-name { color: #e1e3e1; }

.user-card-business {
  font-size: 12px; color: #8a8578;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.dark .user-card-business { color: #8a938f; }

.user-card-stats {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;
  padding: 12px 0; border-top: 1px solid #e8e3d8;
}
.dark .user-card-stats { border-color: rgba(255,255,255,.05); }

.user-card-stat { text-align: center; }

.user-card-stat-label {
  display: block; font-size: 10px; font-weight: 700; color: #8a8578;
  letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 2px;
}
.dark .user-card-stat-label { color: #8a938f; }

.user-card-stat-value {
  font-size: 14px; font-weight: 600; color: #1e1b15;
  font-family: 'JetBrains Mono', monospace;
}
.dark .user-card-stat-value { color: #e1e3e1; }
</style>
