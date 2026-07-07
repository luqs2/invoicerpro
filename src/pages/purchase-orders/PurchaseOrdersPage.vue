<template>
  <div class="page">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">
          Purchase Orders
        </h1>
        <p class="page-sub">
          Manage vendor purchase orders
        </p>
      </div>
      <div class="header-actions">
        <router-link
          to="/app/purchase-orders/new"
          class="btn-primary"
        >
          <Plus :size="16" />
          New Purchase Order
        </router-link>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="toolbar">
      <div class="search-wrap">
        <Search
          :size="16"
          class="search-icon"
        />
        <input
          v-model="search"
          class="search-input"
          placeholder="Search POs…"
          type="text"
        >
      </div>
    </div>

    <!-- Table -->
    <div :class="isMobile ? '' : 'section-card'">
      <div
        v-if="store.loading"
        class="empty-state"
      >
        <p class="empty-sub">
          Loading…
        </p>
      </div>

      <div
        v-else-if="filtered.length === 0"
        class="empty-state"
      >
        <FileText
          :size="40"
          class="empty-icon"
        />
        <p class="empty-title">
          No purchase orders yet
        </p>
        <p class="empty-sub">
          Create your first purchase order to start tracking vendor orders.
        </p>
      </div>

      <table
        v-else-if="!isMobile"
        class="data-table"
      >
        <thead>
          <tr>
            <th>PO Number</th>
            <th>Client</th>
            <th>Date</th>
            <th>Status</th>
            <th class="text-right">
              Total
            </th>
            <th class="th-action" />
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="po in filtered"
            :key="po.id"
            class="table-row"
            @click="router.push(`/app/purchase-orders/${po.id}`)"
          >
            <td class="td-mono">
              {{ po.po_number }}
            </td>
            <td class="td-client">
              {{ po.client_name || '—' }}
            </td>
            <td class="td-muted">
              {{ formatDate(po.order_date) }}
            </td>
            <td>
              <span
                class="status-badge"
                :class="`status-${po.status}`"
              >{{ po.status }}</span>
            </td>
            <td class="td-mono text-right">
              {{ formatCurrency(po.total, po.currency) }}
            </td>
            <td class="td-action">
              <ChevronRight
                :size="16"
                class="row-arrow"
              />
            </td>
          </tr>
        </tbody>
      </table>

      <!-- ── Mobile cards ────────────────────────────────── -->
      <div v-if="filtered.length && isMobile" class="card-list animate-in">
        <div
          v-for="po in filtered"
          :key="po.id"
          class="po-card"
          @click="router.push(`/app/purchase-orders/${po.id}`)"
        >
          <div class="po-card-top">
            <span class="po-card-number">{{ po.po_number }}</span>
            <span class="status-badge" :class="`status-${po.status}`">{{ po.status }}</span>
          </div>
          <p class="po-card-meta">Client: {{ po.client_name || '—' }}</p>
          <p class="po-card-meta">Date: {{ formatDate(po.order_date) }}</p>
          <div class="po-card-bottom">
            <div>
              <p class="po-card-amount-label">TOTAL AMOUNT</p>
              <p class="po-card-amount">{{ formatCurrency(po.total, po.currency) }}</p>
            </div>
            <div class="po-card-actions">
              <button class="act-btn" title="View" @click.stop="router.push(`/app/purchase-orders/${po.id}`)">
                <ChevronRight :size="16" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, Search, FileText, ChevronRight } from '@lucide/vue'
import { usePurchaseOrderStore } from '@/stores/purchaseOrders'
import { useBreakpoint } from '@/composables/useBreakpoint'
import { useFormatters } from '@/composables/useFormatters'

const router = useRouter()
const store = usePurchaseOrderStore()
const { formatCurrency } = useFormatters()
const { isMobile } = useBreakpoint()

const search = ref('')

const filtered = computed(() => {
  if (!search.value) return store.purchaseOrders
  const q = search.value.toLowerCase()
  return store.purchaseOrders.filter(po =>
    po.po_number?.toLowerCase().includes(q) ||
    po.client?.name?.toLowerCase().includes(q)
  )
})

function formatDate(dateStr: string) {
  if (!dateStr) return '—'
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

onMounted(() => {
  store.fetchAll()
  store.subscribe()
})

onUnmounted(() => {
  store.unsubscribe()
})
</script>

<style scoped>
.text-right { text-align: right; }

/* ── Mobile card list ───────────────────────────────────── */
.card-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.po-card {
  background: #F7F4EC;
  border: 1px solid #D6D0C2;
  border-radius: 14px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,.05);
  cursor: pointer;
  transition: box-shadow .15s;
}
.po-card:hover { box-shadow: 0 2px 8px rgba(0,0,0,.1); }

.po-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.po-card-number {
  font-size: 15px;
  font-weight: 700;
  color: #1e1b15;
}

.po-card-meta {
  font-size: 13px;
  color: #8a8578;
  margin: 2px 0;
}

.po-card-bottom {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #e8e3d8;
}

.po-card-amount-label {
  font-size: 10px;
  font-weight: 700;
  color: #8a8578;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  margin: 0 0 3px;
}

.po-card-amount {
  font-size: 20px;
  font-weight: 800;
  color: #08241f;
  margin: 0;
  font-variant-numeric: tabular-nums;
}

.po-card-actions {
  display: flex;
  gap: 4px;
}

.act-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border: 1px solid #D6D0C2;
  background: #EDE8DE;
  cursor: pointer;
  border-radius: 8px;
  color: #414846;
  transition: color .12s, background .12s;
}
.act-btn:hover { color: #1e1b15; background: #D6D0C2; }

/* ── Dark mode ──────────────────────────────────────────── */
.dark .po-card { background: #1d201f; border-color: rgba(255,255,255,.05); }
.dark .po-card-number { color: #e1e3e1; }
.dark .po-card-meta { color: #8a938f; }
.dark .po-card-bottom { border-color: rgba(255,255,255,.05); }
.dark .po-card-amount-label { color: #8a938f; }
.dark .po-card-amount { color: #a0d0c2; }
.dark .act-btn { background: #282b29; border-color: rgba(255,255,255,.05); color: #c0c8c4; }
.dark .act-btn:hover { color: #e1e3e1; background: #323534; }
</style>
