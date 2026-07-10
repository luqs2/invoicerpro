<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Mail, Building2, Calendar, FileText, Receipt, ShoppingCart, Ban, CheckCircle } from '@lucide/vue'
import Badge from '@/components/ui/Badge.vue'
import UiTabs from '@/components/ui/Tabs.vue'
import { getUserDetail, updateUserRole } from '@/services/admin'
import { useBreakpoint } from '@/composables/useBreakpoint'
import { useConfirm } from '@/composables/useConfirm'
import { useToast } from '@/composables/useToast'

const { isMobile } = useBreakpoint()
const { confirm } = useConfirm()
const { showToast } = useToast()

const route = useRoute()
const router = useRouter()
const userId = route.params.id as string

const user = ref<any>(null)
const loading = ref(true)
const activeTab = ref('invoices')

const formatCurrency = (val: number) =>
  new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR', maximumFractionDigits: 0 }).format(val)

const roleBadgeClass = (role?: string): 'default' | 'sent' | 'warning' | 'danger' => {
  if (role === 'super_admin') return 'danger'
  if (role === 'admin') return 'warning'
  if (role === 'viewer') return 'sent'
  if (role === 'banned') return 'danger'
  return 'default'
}

async function handleBanUser() {
  if (!user.value) return
  const ok = await confirm({
    title: 'Ban user',
    message: `Ban "${user.value.full_name || 'this user'}"? They will not be able to access the platform.`,
    confirmText: 'Ban User',
    variant: 'danger',
  })
  if (!ok) return
  try {
    await updateUserRole(userId, 'banned')
    showToast('User has been banned')
    user.value = await getUserDetail(userId)
  } catch (e: any) {
    showToast('Failed to ban user: ' + e.message, 'danger')
  }
}

async function handleUnbanUser() {
  if (!user.value) return
  const ok = await confirm({
    title: 'Unban user',
    message: `Unban "${user.value.full_name || 'this user'}"? They will regain access to the platform.`,
    confirmText: 'Unban User',
    variant: 'info',
  })
  if (!ok) return
  try {
    await updateUserRole(userId, 'user')
    showToast('User has been unbanned')
    user.value = await getUserDetail(userId)
  } catch (e: any) {
    showToast('Failed to unban user: ' + e.message, 'danger')
  }
}

const statusBadgeClass = (status: string): 'default' | 'sent' | 'paid' | 'overdue' | 'cancelled' => {
  const map: Record<string, 'default' | 'sent' | 'paid' | 'overdue' | 'cancelled'> = {
    draft: 'default', sent: 'sent', paid: 'paid',
    overdue: 'overdue', cancelled: 'cancelled',
    received: 'paid',
  }
  return map[status] || 'default'
}

const stats = computed(() => user.value?.stats ?? { invoice_count: 0, receipt_count: 0, po_count: 0, total_revenue: 0 })

const currentTabData = computed(() => {
  if (!user.value) return []
  if (activeTab.value === 'invoices') return user.value.invoices ?? []
  if (activeTab.value === 'receipts') return user.value.receipts ?? []
  if (activeTab.value === 'purchase-orders') return user.value.purchase_orders ?? []
  return []
})

onMounted(async () => {
  try {
    user.value = await getUserDetail(userId)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="page">
    <!-- Back button -->
    <button class="back-btn" @click="router.push('/app/admin/users')">
      <ArrowLeft :size="16" />
      Back to Users
    </button>

    <!-- Loading -->
    <template v-if="loading">
      <div class="profile-card skeleton-card">
        <div class="skeleton" style="width: 64px; height: 64px; border-radius: 50%;" />
        <div style="flex: 1;">
          <div class="skeleton" style="width: 180px; height: 20px; margin-bottom: 8px;" />
          <div class="skeleton" style="width: 140px; height: 14px;" />
        </div>
      </div>
    </template>

    <template v-else-if="user">
      <!-- Profile card -->
      <div class="profile-card">
        <div class="profile-avatar" :class="{ 'avatar-banned': user.role === 'banned' }">
          {{ user.full_name?.charAt(0)?.toUpperCase() || '?' }}
        </div>
        <div class="profile-info">
          <div class="profile-name-row">
            <h1 class="profile-name">{{ user.full_name || 'Unnamed User' }}</h1>
            <Badge :variant="roleBadgeClass(user.role)">{{ user.role || 'user' }}</Badge>
          </div>
          <div class="profile-meta">
            <span v-if="user.business?.email" class="meta-item">
              <Mail :size="14" />
              {{ user.business.email }}
            </span>
            <span v-if="user.business?.name" class="meta-item">
              <Building2 :size="14" />
              {{ user.business.name }}
            </span>
            <span class="meta-item">
              <Calendar :size="14" />
              Joined {{ user.created_at ? new Date(user.created_at).toLocaleDateString() : '-' }}
            </span>
          </div>
        </div>
        <div class="profile-actions">
          <button
            v-if="user.role !== 'banned'"
            class="action-btn danger"
            @click="handleBanUser"
          >
            <Ban :size="14" />
            Ban User
          </button>
          <button
            v-else
            class="action-btn success"
            @click="handleUnbanUser"
          >
            <CheckCircle :size="14" />
            Unban User
          </button>
        </div>
      </div>

      <!-- Stats row -->
      <div class="stats-row">
        <div class="stat-mini">
          <FileText :size="16" class="stat-mini-icon" />
          <div>
            <span class="stat-mini-value">{{ stats.invoice_count }}</span>
            <span class="stat-mini-label">Invoices</span>
          </div>
        </div>
        <div class="stat-mini">
          <Receipt :size="16" class="stat-mini-icon" />
          <div>
            <span class="stat-mini-value">{{ stats.receipt_count }}</span>
            <span class="stat-mini-label">Receipts</span>
          </div>
        </div>
        <div class="stat-mini">
          <ShoppingCart :size="16" class="stat-mini-icon" />
          <div>
            <span class="stat-mini-value">{{ stats.po_count }}</span>
            <span class="stat-mini-label">Purchase Orders</span>
          </div>
        </div>
        <div class="stat-mini">
          <span class="stat-mini-icon currency-icon">$</span>
          <div>
            <span class="stat-mini-value">{{ formatCurrency(stats.total_revenue) }}</span>
            <span class="stat-mini-label">Revenue</span>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="tabs-wrapper">
        <UiTabs
          v-model="activeTab"
          :tabs="[
            { value: 'invoices', label: 'Invoices' },
            { value: 'receipts', label: 'Receipts' },
            { value: 'purchase-orders', label: 'Purchase Orders' },
          ]"
        />
      </div>

      <!-- Tab content -->
      <div class="section-card">
        <!-- ── Invoices ── -->
        <!-- Desktop -->
        <table v-if="activeTab === 'invoices' && !isMobile" class="data-table">
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Client</th>
              <th>Status</th>
              <th>Total</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="inv in user.invoices" :key="inv.id" class="table-row">
              <td class="td-mono td-bold">{{ inv.invoice_number }}</td>
              <td>{{ inv.client?.name || '-' }}</td>
              <td><Badge :variant="statusBadgeClass(inv.status)">{{ inv.status }}</Badge></td>
              <td class="td-mono td-bold">{{ formatCurrency(Number(inv.total)) }}</td>
              <td class="td-muted">{{ new Date(inv.created_at).toLocaleDateString() }}</td>
            </tr>
          </tbody>
        </table>
        <!-- Mobile -->
        <div v-if="activeTab === 'invoices' && isMobile" class="card-list">
          <div v-for="inv in user.invoices" :key="inv.id" class="inv-card">
            <div class="inv-card-top">
              <span class="inv-card-number">{{ inv.invoice_number }}</span>
              <Badge :variant="statusBadgeClass(inv.status)">{{ inv.status }}</Badge>
            </div>
            <p class="inv-card-meta">Client: {{ inv.client?.name || '-' }}</p>
            <div class="inv-card-bottom">
              <div>
                <p class="inv-card-amount-label">TOTAL</p>
                <p class="inv-card-amount">{{ formatCurrency(Number(inv.total)) }}</p>
              </div>
              <span class="inv-card-date td-muted">{{ new Date(inv.created_at).toLocaleDateString() }}</span>
            </div>
          </div>
        </div>

        <!-- ── Receipts ── -->
        <!-- Desktop -->
        <table v-if="activeTab === 'receipts' && !isMobile" class="data-table">
          <thead>
            <tr>
              <th>Receipt #</th>
              <th>Client</th>
              <th>Amount</th>
              <th>Method</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in user.receipts" :key="r.id" class="table-row">
              <td class="td-mono td-bold">{{ r.receipt_number }}</td>
              <td>{{ r.client?.name || '-' }}</td>
              <td class="td-mono td-bold">{{ formatCurrency(Number(r.amount)) }}</td>
              <td><Badge variant="default">{{ r.payment_method }}</Badge></td>
              <td class="td-muted">{{ new Date(r.payment_date || r.created_at).toLocaleDateString() }}</td>
            </tr>
          </tbody>
        </table>
        <!-- Mobile -->
        <div v-if="activeTab === 'receipts' && isMobile" class="card-list">
          <div v-for="r in user.receipts" :key="r.id" class="rcp-card">
            <div class="rcp-card-top">
              <span class="rcp-card-number">{{ r.receipt_number }}</span>
              <Badge variant="default">{{ r.payment_method }}</Badge>
            </div>
            <p class="rcp-card-meta">Client: {{ r.client?.name || '-' }}</p>
            <div class="rcp-card-bottom">
              <div>
                <p class="rcp-card-amount-label">AMOUNT</p>
                <p class="rcp-card-amount">{{ formatCurrency(Number(r.amount)) }}</p>
              </div>
              <span class="rcp-card-date td-muted">{{ new Date(r.payment_date || r.created_at).toLocaleDateString() }}</span>
            </div>
          </div>
        </div>

        <!-- ── Purchase Orders ── -->
        <!-- Desktop -->
        <table v-if="activeTab === 'purchase-orders' && !isMobile" class="data-table">
          <thead>
            <tr>
              <th>PO #</th>
              <th>Client</th>
              <th>Status</th>
              <th>Total</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="po in user.purchase_orders" :key="po.id" class="table-row">
              <td class="td-mono td-bold">{{ po.po_number }}</td>
              <td>{{ po.client?.name || '-' }}</td>
              <td><Badge :variant="statusBadgeClass(po.status)">{{ po.status }}</Badge></td>
              <td class="td-mono td-bold">{{ formatCurrency(Number(po.total)) }}</td>
              <td class="td-muted">{{ new Date(po.created_at).toLocaleDateString() }}</td>
            </tr>
          </tbody>
        </table>
        <!-- Mobile -->
        <div v-if="activeTab === 'purchase-orders' && isMobile" class="card-list">
          <div v-for="po in user.purchase_orders" :key="po.id" class="po-card">
            <div class="po-card-top">
              <span class="po-card-number">{{ po.po_number }}</span>
              <Badge :variant="statusBadgeClass(po.status)">{{ po.status }}</Badge>
            </div>
            <p class="po-card-meta">Client: {{ po.client?.name || '-' }}</p>
            <div class="po-card-bottom">
              <div>
                <p class="po-card-amount-label">TOTAL</p>
                <p class="po-card-amount">{{ formatCurrency(Number(po.total)) }}</p>
              </div>
              <span class="po-card-date td-muted">{{ new Date(po.created_at).toLocaleDateString() }}</span>
            </div>
          </div>
        </div>

        <div v-if="currentTabData.length === 0" class="empty-state">
          <p>No {{ activeTab.replace('-', ' ') }} found</p>
        </div>
      </div>
    </template>

    <template v-else>
      <div class="empty-state" style="padding: 60px;">
        <p>User not found</p>
      </div>
    </template>
  </div>
</template>

<style scoped>
.page { padding: 24px; max-width: 1200px; }

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #414846;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  margin-bottom: 20px;
  font-weight: 500;
}
.dark .back-btn { color: #c0c8c4; }
.back-btn:hover { color: #B5652D; }

.profile-card {
  background: #F7F4EC;
  border: 1px solid #D6D0C2;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 16px;
}
.dark .profile-card { background: #1d201f; border-color: #404945; }

.profile-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #08241f;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 700;
  flex-shrink: 0;
}
.avatar-banned { background: #dc2626; }

.profile-info { flex: 1; min-width: 0; }

.profile-actions { flex-shrink: 0; }

.action-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 16px; border: none; border-radius: 8px;
  font-size: 13px; font-weight: 600; cursor: pointer;
  transition: all 0.15s;
}
.action-btn.danger { background: #dc2626; color: #fff; }
.action-btn.danger:hover { background: #b91c1c; }
.action-btn.success { background: #16a34a; color: #fff; }
.action-btn.success:hover { background: #15803d; }
.dark .action-btn.danger { background: #991b1b; }
.dark .action-btn.danger:hover { background: #7f1d1d; }
.dark .action-btn.success { background: #166534; }
.dark .action-btn.success:hover { background: #14532d; }

.profile-name-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}

.profile-name {
  font-family: 'Merriweather', Georgia, serif;
  font-size: 20px;
  font-weight: 700;
  color: #1e1b15;
  margin: 0;
}
.dark .profile-name { color: #e1e3e1; }

.profile-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #414846;
}
.dark .meta-item { color: #c0c8c4; }

.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.stat-mini {
  background: #F7F4EC;
  border: 1px solid #D6D0C2;
  border-radius: 10px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}
.dark .stat-mini { background: #1d201f; border-color: #404945; }

.stat-mini-icon { color: #B5652D; flex-shrink: 0; }

.currency-icon {
  font-size: 16px;
  font-weight: 700;
}

.stat-mini-value {
  display: block;
  font-size: 18px;
  font-weight: 700;
  color: #1e1b15;
  font-family: 'JetBrains Mono', monospace;
}
.dark .stat-mini-value { color: #e1e3e1; }

.stat-mini-label {
  display: block;
  font-size: 12px;
  color: #414846;
}
.dark .stat-mini-label { color: #c0c8c4; }

.tabs-wrapper { margin-bottom: 16px; }

.section-card {
  background: #F7F4EC;
  border: 1px solid #D6D0C2;
  border-radius: 12px;
  overflow: hidden;
}
.dark .section-card { background: #1d201f; border-color: #404945; }

.data-table { width: 100%; border-collapse: collapse; }

.data-table th {
  text-align: left;
  font-size: 12px;
  font-weight: 600;
  color: #414846;
  padding: 12px 16px;
  border-bottom: 1px solid #D6D0C2;
}
.dark .data-table th { color: #c0c8c4; border-color: #404945; }

.data-table td {
  padding: 10px 16px;
  font-size: 14px;
  color: #1e1b15;
  border-bottom: 1px solid #D6D0C2;
}
.dark .data-table td { color: #e1e3e1; border-color: #404945; }

.table-row { transition: background 0.12s; }
.table-row:hover { background: #EDE8DE; }
.dark .table-row:hover { background: #323534; }

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

.skeleton-card { align-items: center; }

@media (max-width: 768px) {
  .stats-row { grid-template-columns: repeat(2, 1fr); }
  .profile-card { flex-direction: column; text-align: center; }
  .profile-name-row { justify-content: center; }
  .profile-meta { justify-content: center; }
  .profile-actions { margin-top: 12px; }
}

/* Mobile card list */
.card-list { display: flex; flex-direction: column; gap: 12px; padding: 16px; }

.inv-card, .rcp-card, .po-card {
  background: #F7F4EC; border: 1px solid #D6D0C2; border-radius: 14px;
  padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,.05);
}
.dark .inv-card, .dark .rcp-card, .dark .po-card { background: #1d201f; border-color: rgba(255,255,255,.05); }

.inv-card-top, .rcp-card-top, .po-card-top {
  display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;
}

.inv-card-number, .rcp-card-number, .po-card-number {
  font-size: 15px; font-weight: 700; color: #1e1b15;
}
.dark .inv-card-number, .dark .rcp-card-number, .dark .po-card-number { color: #e1e3e1; }

.inv-card-meta, .rcp-card-meta, .po-card-meta {
  font-size: 13px; color: #8a8578; margin: 2px 0;
}
.dark .inv-card-meta, .dark .rcp-card-meta, .dark .po-card-meta { color: #8a938f; }

.inv-card-bottom, .rcp-card-bottom, .po-card-bottom {
  display: flex; align-items: flex-end; justify-content: space-between;
  margin-top: 12px; padding-top: 12px; border-top: 1px solid #e8e3d8;
}
.dark .inv-card-bottom, .dark .rcp-card-bottom, .dark .po-card-bottom { border-color: rgba(255,255,255,.05); }

.inv-card-amount-label, .rcp-card-amount-label, .po-card-amount-label {
  font-size: 10px; font-weight: 700; color: #8a8578;
  letter-spacing: 0.8px; text-transform: uppercase; margin: 0 0 3px;
}
.dark .inv-card-amount-label, .dark .rcp-card-amount-label, .dark .po-card-amount-label { color: #8a938f; }

.inv-card-amount, .rcp-card-amount, .po-card-amount {
  font-size: 20px; font-weight: 800; color: #08241f; margin: 0;
  font-variant-numeric: tabular-nums;
}
.dark .inv-card-amount, .dark .rcp-card-amount, .dark .po-card-amount { color: #a0d0c2; }

.inv-card-date, .rcp-card-date, .po-card-date { font-size: 12px; }
</style>
