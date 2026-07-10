<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ShoppingCart, Download } from '@lucide/vue'
import Badge from '@/components/ui/Badge.vue'
import Pagination from '@/components/ui/Pagination.vue'
import AdminStatCard from '@/components/admin/AdminStatCard.vue'
import Skeleton from '@/components/ui/Skeleton.vue'
import { getPOStats } from '@/services/admin'
import { supabaseAdmin } from '@/services/supabase'
import { useBreakpoint } from '@/composables/useBreakpoint'
import { usePermissions } from '@/composables/usePermissions'

const { isMobile } = useBreakpoint()
const { canExportData } = usePermissions()

const loading = ref(true)
const pos = ref<any[]>([])
const total = ref(0)
const page = ref(1)
const limit = 20
const statusFilter = ref('')
const stats = ref<any>(null)

const formatCurrency = (val: number) =>
  new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR', maximumFractionDigits: 0 }).format(val)

const statusBadgeClass = (status: string): 'default' | 'sent' | 'paid' | 'cancelled' => {
  const map: Record<string, 'default' | 'sent' | 'paid' | 'cancelled'> = { draft: 'default', sent: 'sent', received: 'paid', cancelled: 'cancelled' }
  return map[status] || 'default'
}

async function fetchPOs() {
  loading.value = true
  try {
    const client = supabaseAdmin ?? (await import('@/services/supabase')).supabase
    let query = client
      .from('purchase_orders')
      .select('id, po_number, status, total, currency, created_at, user_id, client_id', { count: 'exact' })

    if (statusFilter.value) {
      query = query.eq('status', statusFilter.value)
    }

    const from = (page.value - 1) * limit
    const { data, count } = await query
      .order('created_at', { ascending: false })
      .range(from, from + limit - 1)

    const poData = data ?? []
    total.value = count ?? 0

    const userIds = [...new Set(poData.map((p: any) => p.user_id).filter(Boolean))]
    const clientIds = [...new Set(poData.map((p: any) => p.client_id).filter(Boolean))]

    const [usersRes, clientsRes] = await Promise.all([
      userIds.length ? client.from('profiles').select('id, full_name').in('id', userIds) : { data: [] },
      clientIds.length ? client.from('clients').select('id, name').in('id', clientIds) : { data: [] },
    ])

    const userMap: Record<string, string> = {}
    ;(usersRes.data ?? []).forEach((u: any) => { userMap[u.id] = u.full_name })
    const clientMap: Record<string, string> = {}
    ;(clientsRes.data ?? []).forEach((c: any) => { clientMap[c.id] = c.name })

    pos.value = poData.map((po: any) => ({
      ...po,
      user: userMap[po.user_id] ? { full_name: userMap[po.user_id] } : null,
      client: clientMap[po.client_id] ? { name: clientMap[po.client_id] } : null,
    }))
  } finally {
    loading.value = false
  }
}

function exportCSV() {
  const headers = ['PO #', 'User', 'Client', 'Status', 'Total', 'Date']
  const rows = pos.value.map(po => [
    po.po_number,
    po.user?.full_name || '',
    po.client?.name || '',
    po.status,
    po.total,
    new Date(po.created_at).toLocaleDateString(),
  ])
  const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = 'purchase-orders.csv'; a.click()
  URL.revokeObjectURL(url)
}

function onPageChange(p: number) { page.value = p; fetchPOs() }

onMounted(async () => {
  const [statsData] = await Promise.all([getPOStats(), fetchPOs()])
  stats.value = statsData
})
</script>

<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="page-title">All Purchase Orders</h1>
        <p class="page-sub">Platform-wide purchase order overview</p>
      </div>
      <button v-if="canExportData" class="btn-outline" @click="exportCSV">
        <Download :size="16" />
        Export CSV
      </button>
    </div>

    <div v-if="stats" class="stats-grid">
      <AdminStatCard :icon="ShoppingCart" label="Total POs" :value="stats.total_count" color="#08241f" />
      <AdminStatCard :icon="ShoppingCart" label="Total Value" :value="formatCurrency(stats.total_value)" color="#B5652D" />
      <AdminStatCard
        :icon="ShoppingCart"
        label="Pending"
        :value="stats.status_breakdown?.find((s: any) => s.status === 'sent')?.count ?? 0"
        color="#d97706"
      />
    </div>

    <div class="toolbar">
      <select v-model="statusFilter" class="filter-select" @change="page = 1; fetchPOs()">
        <option value="">All Statuses</option>
        <option value="draft">Draft</option>
        <option value="sent">Sent</option>
        <option value="received">Received</option>
        <option value="cancelled">Cancelled</option>
      </select>
    </div>

    <!-- Loading skeleton -->
    <div v-if="loading" class="section-card">
      <div v-for="i in 5" :key="i" class="skeleton-row">
        <Skeleton variant="text" style="width: 100px;" />
        <Skeleton variant="text" style="width: 120px;" />
        <Skeleton variant="text" style="width: 100px;" />
        <Skeleton variant="rect" style="width: 70px; height: 22px;" />
        <Skeleton variant="text" style="width: 80px;" />
        <Skeleton variant="text" style="width: 90px;" />
      </div>
    </div>

    <!-- Desktop table -->
    <div v-else-if="!isMobile" class="section-card">
      <table class="data-table">
        <thead>
          <tr>
            <th>PO #</th>
            <th>User</th>
            <th>Client</th>
            <th>Status</th>
            <th>Total</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="po in pos" :key="po.id" class="table-row">
            <td class="td-mono td-bold">{{ po.po_number }}</td>
            <td>{{ po.user?.full_name || '-' }}</td>
            <td>{{ po.client?.name || '-' }}</td>
            <td><Badge :variant="statusBadgeClass(po.status)">{{ po.status }}</Badge></td>
            <td class="td-mono td-bold">{{ formatCurrency(Number(po.total)) }}</td>
            <td class="td-muted">{{ new Date(po.created_at).toLocaleDateString() }}</td>
          </tr>
        </tbody>
      </table>

      <div v-if="pos.length === 0 && !loading" class="empty-state">
        <ShoppingCart :size="40" class="empty-icon" />
        <p>No purchase orders found</p>
      </div>

      <Pagination v-if="total > limit" :current-page="page" :total="total" :page-size="limit" @update:current-page="onPageChange" />
    </div>

    <!-- Mobile cards -->
    <div v-else-if="isMobile" class="card-list">
      <div v-for="po in pos" :key="po.id" class="po-card">
        <div class="po-card-top">
          <span class="po-card-number">{{ po.po_number }}</span>
          <Badge :variant="statusBadgeClass(po.status)">{{ po.status }}</Badge>
        </div>
        <p class="po-card-meta">User: {{ po.user?.full_name || '-' }}</p>
        <p class="po-card-meta">Client: {{ po.client?.name || '-' }}</p>
        <div class="po-card-bottom">
          <div>
            <p class="po-card-amount-label">TOTAL</p>
            <p class="po-card-amount">{{ formatCurrency(Number(po.total)) }}</p>
          </div>
          <span class="po-card-date td-muted">{{ new Date(po.created_at).toLocaleDateString() }}</span>
        </div>
      </div>
      <div v-if="pos.length === 0 && !loading" class="empty-state">
        <ShoppingCart :size="40" class="empty-icon" />
        <p>No purchase orders found</p>
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

.btn-outline { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border: 1px solid #D6D0C2; border-radius: 8px; font-size: 13px; font-weight: 500; background: #F7F4EC; color: #1e1b15; cursor: pointer; transition: all 0.15s; }
.dark .btn-outline { background: #1d201f; border-color: #404945; color: #e1e3e1; }
.btn-outline:hover { border-color: #B5652D; color: #B5652D; }

.stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
.toolbar { margin-bottom: 16px; }
.filter-select { padding: 8px 12px; border: 1px solid #D6D0C2; border-radius: 8px; font-size: 13px; background: #F7F4EC; color: #1e1b15; cursor: pointer; }
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

.po-card {
  background: #F7F4EC; border: 1px solid #D6D0C2; border-radius: 14px;
  padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,.05);
}
.dark .po-card { background: #1d201f; border-color: rgba(255,255,255,.05); }

.po-card-top {
  display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;
}

.po-card-number { font-size: 15px; font-weight: 700; color: #1e1b15; }
.dark .po-card-number { color: #e1e3e1; }

.po-card-meta { font-size: 13px; color: #8a8578; margin: 2px 0; }
.dark .po-card-meta { color: #8a938f; }

.po-card-bottom {
  display: flex; align-items: flex-end; justify-content: space-between;
  margin-top: 12px; padding-top: 12px; border-top: 1px solid #e8e3d8;
}
.dark .po-card-bottom { border-color: rgba(255,255,255,.05); }

.po-card-amount-label {
  font-size: 10px; font-weight: 700; color: #8a8578;
  letter-spacing: 0.8px; text-transform: uppercase; margin: 0 0 3px;
}
.dark .po-card-amount-label { color: #8a938f; }

.po-card-amount {
  font-size: 20px; font-weight: 800; color: #08241f; margin: 0;
  font-variant-numeric: tabular-nums;
}
.dark .po-card-amount { color: #a0d0c2; }

.po-card-date { font-size: 12px; }
</style>
