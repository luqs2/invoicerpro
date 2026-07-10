<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { FileText, Download } from '@lucide/vue'
import Badge from '@/components/ui/Badge.vue'
import Pagination from '@/components/ui/Pagination.vue'
import AdminStatCard from '@/components/admin/AdminStatCard.vue'
import Skeleton from '@/components/ui/Skeleton.vue'
import { getInvoiceStats } from '@/services/admin'
import { supabaseAdmin } from '@/services/supabase'
import { useBreakpoint } from '@/composables/useBreakpoint'
import { usePermissions } from '@/composables/usePermissions'

const { isMobile } = useBreakpoint()
const { canExportData } = usePermissions()

const loading = ref(true)
const invoices = ref<any[]>([])
const total = ref(0)
const page = ref(1)
const limit = 20
const statusFilter = ref('')
const stats = ref<any>(null)

const formatCurrency = (val: number) =>
  new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR', maximumFractionDigits: 0 }).format(val)

const statusBadgeClass = (status: string): 'default' | 'sent' | 'paid' | 'overdue' | 'cancelled' => {
  const map: Record<string, 'default' | 'sent' | 'paid' | 'overdue' | 'cancelled'> = { draft: 'default', sent: 'sent', paid: 'paid', overdue: 'overdue', cancelled: 'cancelled' }
  return map[status] || 'default'
}

async function fetchInvoices() {
  loading.value = true
  try {
    const client = supabaseAdmin ?? (await import('@/services/supabase')).supabase
    let query = client
      .from('invoices')
      .select('id, invoice_number, status, total, currency, created_at, user_id, client_id', { count: 'exact' })

    if (statusFilter.value) {
      query = query.eq('status', statusFilter.value)
    }

    const from = (page.value - 1) * limit
    const { data, count } = await query
      .order('created_at', { ascending: false })
      .range(from, from + limit - 1)

    const invoicesData = data ?? []
    total.value = count ?? 0

    // Fetch user and client names separately
    const userIds = [...new Set(invoicesData.map((i: any) => i.user_id).filter(Boolean))]
    const clientIds = [...new Set(invoicesData.map((i: any) => i.client_id).filter(Boolean))]

    const [usersRes, clientsRes] = await Promise.all([
      userIds.length ? client.from('profiles').select('id, full_name').in('id', userIds) : { data: [] },
      clientIds.length ? client.from('clients').select('id, name').in('id', clientIds) : { data: [] },
    ])

    const userMap: Record<string, string> = {}
    ;(usersRes.data ?? []).forEach((u: any) => { userMap[u.id] = u.full_name })
    const clientMap: Record<string, string> = {}
    ;(clientsRes.data ?? []).forEach((c: any) => { clientMap[c.id] = c.name })

    invoices.value = invoicesData.map((inv: any) => ({
      ...inv,
      user: userMap[inv.user_id] ? { full_name: userMap[inv.user_id] } : null,
      client: clientMap[inv.client_id] ? { name: clientMap[inv.client_id] } : null,
    }))
  } finally {
    loading.value = false
  }
}

function exportCSV() {
  const headers = ['Invoice #', 'User', 'Client', 'Status', 'Total', 'Date']
  const rows = invoices.value.map(inv => [
    inv.invoice_number,
    inv.user?.full_name || '',
    inv.client?.name || '',
    inv.status,
    inv.total,
    new Date(inv.created_at).toLocaleDateString(),
  ])
  const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'invoices.csv'
  a.click()
  URL.revokeObjectURL(url)
}

function onPageChange(p: number) {
  page.value = p
  fetchInvoices()
}

onMounted(async () => {
  const [statsData] = await Promise.all([getInvoiceStats(), fetchInvoices()])
  stats.value = statsData
})
</script>

<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="page-title">All Invoices</h1>
        <p class="page-sub">Platform-wide invoice overview</p>
      </div>
      <button v-if="canExportData" class="btn-outline" @click="exportCSV">
        <Download :size="16" />
        Export CSV
      </button>
    </div>

    <!-- Stats -->
    <div v-if="stats" class="stats-grid">
      <AdminStatCard :icon="FileText" label="Total Invoices" :value="stats.total_count" color="#B5652D" />
      <AdminStatCard :icon="FileText" label="Total Value" :value="formatCurrency(stats.total_value)" color="#16a34a" />
      <AdminStatCard :icon="FileText" label="Average Value" :value="formatCurrency(stats.avg_value)" color="#0ea5e9" />
      <AdminStatCard
        :icon="FileText"
        label="Overdue"
        :value="stats.status_breakdown?.find((s: any) => s.status === 'overdue')?.count ?? 0"
        color="#dc2626"
      />
    </div>

    <!-- Filters -->
    <div class="toolbar">
      <select v-model="statusFilter" class="filter-select" @change="page = 1; fetchInvoices()">
        <option value="">All Statuses</option>
        <option value="draft">Draft</option>
        <option value="sent">Sent</option>
        <option value="paid">Paid</option>
        <option value="overdue">Overdue</option>
        <option value="cancelled">Cancelled</option>
      </select>
    </div>

    <!-- Loading skeleton -->
    <div v-if="loading" class="section-card">
      <div v-for="i in 5" :key="i" class="skeleton-row">
        <Skeleton variant="text" style="width: 100px;" />
        <Skeleton variant="text" style="width: 120px;" />
        <Skeleton variant="text" style="width: 100px;" />
        <Skeleton variant="rect" style="width: 60px; height: 22px;" />
        <Skeleton variant="text" style="width: 80px;" />
        <Skeleton variant="text" style="width: 90px;" />
      </div>
    </div>

    <!-- Desktop table -->
    <div v-else-if="!isMobile" class="section-card">
      <table class="data-table">
        <thead>
          <tr>
            <th>Invoice #</th>
            <th>User</th>
            <th>Client</th>
            <th>Status</th>
            <th>Total</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="inv in invoices" :key="inv.id" class="table-row">
            <td class="td-mono td-bold">{{ inv.invoice_number }}</td>
            <td>{{ inv.user?.full_name || '-' }}</td>
            <td>{{ inv.client?.name || '-' }}</td>
            <td><Badge :variant="statusBadgeClass(inv.status)">{{ inv.status }}</Badge></td>
            <td class="td-mono td-bold">{{ formatCurrency(Number(inv.total)) }}</td>
            <td class="td-muted">{{ new Date(inv.created_at).toLocaleDateString() }}</td>
          </tr>
        </tbody>
      </table>

      <div v-if="invoices.length === 0 && !loading" class="empty-state">
        <FileText :size="40" class="empty-icon" />
        <p>No invoices found</p>
      </div>

      <Pagination v-if="total > limit" :current-page="page" :total="total" :page-size="limit" @update:current-page="onPageChange" />
    </div>

    <!-- Mobile cards -->
    <div v-else-if="isMobile" class="card-list">
      <div v-for="inv in invoices" :key="inv.id" class="inv-card">
        <div class="inv-card-top">
          <span class="inv-card-number">{{ inv.invoice_number }}</span>
          <Badge :variant="statusBadgeClass(inv.status)">{{ inv.status }}</Badge>
        </div>
        <p class="inv-card-meta">User: {{ inv.user?.full_name || '-' }}</p>
        <p class="inv-card-meta">Client: {{ inv.client?.name || '-' }}</p>
        <div class="inv-card-bottom">
          <div>
            <p class="inv-card-amount-label">TOTAL</p>
            <p class="inv-card-amount">{{ formatCurrency(Number(inv.total)) }}</p>
          </div>
          <span class="inv-card-date td-muted">{{ new Date(inv.created_at).toLocaleDateString() }}</span>
        </div>
      </div>
      <div v-if="invoices.length === 0 && !loading" class="empty-state">
        <FileText :size="40" class="empty-icon" />
        <p>No invoices found</p>
      </div>
      <Pagination v-if="total > limit" :current-page="page" :total="total" :page-size="limit" @update:current-page="onPageChange" />
    </div>
  </div>
</template>

<style scoped>
.page { padding: 24px; }
.page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; }
.page-title { font-family: 'Merriweather', Georgia, serif; font-size: 24px; font-weight: 700; color: #1e1b15; margin: 0; }
.dark .page-title { color: #e1e3e1; }
.page-sub { font-size: 14px; color: #414846; margin: 4px 0 0; }
.dark .page-sub { color: #c0c8c4; }

.btn-outline {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 16px; border: 1px solid #D6D0C2; border-radius: 8px;
  font-size: 13px; font-weight: 500; background: #F7F4EC; color: #1e1b15;
  cursor: pointer; transition: all 0.15s;
}
.dark .btn-outline { background: #1d201f; border-color: #404945; color: #e1e3e1; }
.btn-outline:hover { border-color: #B5652D; color: #B5652D; }

.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }

.toolbar { margin-bottom: 16px; }

.filter-select {
  padding: 8px 12px; border: 1px solid #D6D0C2; border-radius: 8px;
  font-size: 13px; background: #F7F4EC; color: #1e1b15; cursor: pointer;
}
.dark .filter-select { background: #1d201f; border-color: #404945; color: #e1e3e1; }

.section-card { background: #F7F4EC; border: 1px solid #D6D0C2; border-radius: 12px; overflow: hidden; }
.dark .section-card { background: #1d201f; border-color: #404945; }

.data-table { width: 100%; border-collapse: collapse; }
.data-table th { text-align: left; font-size: 12px; font-weight: 600; color: #414846; padding: 12px 16px; border-bottom: 1px solid #D6D0C2; }
.dark .data-table th { color: #c0c8c4; border-color: #404945; }
.data-table td { padding: 10px 16px; font-size: 14px; color: #1e1b15; border-bottom: 1px solid #D6D0C2; }
.dark .data-table td { color: #e1e3e1; border-color: #404945; }
.table-row { transition: background 0.12s; }
.table-row:hover { background: #EDE8DE; }
.dark .table-row:hover { background: #323534; }

.td-bold { font-weight: 600; }
.td-muted { font-size: 12px; color: #414846; }
.dark .td-muted { color: #c0c8c4; }
.td-mono { font-family: 'JetBrains Mono', monospace; }

.empty-state { text-align: center; padding: 40px 20px; color: #414846; }
.dark .empty-state { color: #c0c8c4; }
.empty-icon { opacity: 0.4; margin-bottom: 8px; }

.skeleton-row {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 16px; border-bottom: 1px solid #D6D0C2;
}
.dark .skeleton-row { border-color: #404945; }

@media (max-width: 1024px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 640px) { .stats-grid { grid-template-columns: 1fr; } .page { padding: 16px; } }

/* Mobile card list */
.card-list { display: flex; flex-direction: column; gap: 12px; }

.inv-card {
  background: #F7F4EC; border: 1px solid #D6D0C2; border-radius: 14px;
  padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,.05);
}
.dark .inv-card { background: #1d201f; border-color: rgba(255,255,255,.05); }

.inv-card-top {
  display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;
}

.inv-card-number { font-size: 15px; font-weight: 700; color: #1e1b15; }
.dark .inv-card-number { color: #e1e3e1; }

.inv-card-meta { font-size: 13px; color: #8a8578; margin: 2px 0; }
.dark .inv-card-meta { color: #8a938f; }

.inv-card-bottom {
  display: flex; align-items: flex-end; justify-content: space-between;
  margin-top: 12px; padding-top: 12px; border-top: 1px solid #e8e3d8;
}
.dark .inv-card-bottom { border-color: rgba(255,255,255,.05); }

.inv-card-amount-label {
  font-size: 10px; font-weight: 700; color: #8a8578;
  letter-spacing: 0.8px; text-transform: uppercase; margin: 0 0 3px;
}
.dark .inv-card-amount-label { color: #8a938f; }

.inv-card-amount {
  font-size: 20px; font-weight: 800; color: #08241f; margin: 0;
  font-variant-numeric: tabular-nums;
}
.dark .inv-card-amount { color: #a0d0c2; }

.inv-card-date { font-size: 12px; }
</style>
