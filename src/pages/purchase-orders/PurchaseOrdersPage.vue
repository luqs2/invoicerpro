<template>
  <div class="page">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Purchase Orders</h1>
        <p class="page-sub">Manage vendor purchase orders</p>
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
        <Search :size="16" class="search-icon" />
        <input
          v-model="search"
          class="search-input"
          placeholder="Search POs…"
          type="text"
        >
      </div>
    </div>

    <!-- Table -->
    <div class="section-card">
      <div
        v-if="store.loading"
        class="empty-state"
      >
        <p class="empty-sub">Loading…</p>
      </div>

      <div
        v-else-if="filtered.length === 0"
        class="empty-state"
      >
        <FileText :size="40" class="empty-icon" />
        <p class="empty-title">No purchase orders yet</p>
        <p class="empty-sub">Create your first purchase order to start tracking vendor orders.</p>
      </div>

      <table
        v-else
        class="data-table"
      >
        <thead>
          <tr>
            <th>PO Number</th>
            <th>Client</th>
            <th>Date</th>
            <th>Status</th>
            <th class="text-right">Total</th>
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
            <td class="td-mono">{{ po.po_number }}</td>
            <td class="td-client">{{ po.client_name || '—' }}</td>
            <td class="td-muted">{{ formatDate(po.order_date) }}</td>
            <td>
              <span class="status-badge" :class="`status-${po.status}`">{{ po.status }}</span>
            </td>
            <td class="td-mono text-right">{{ formatCurrency(po.total, po.currency) }}</td>
            <td class="td-action">
              <ChevronRight :size="16" class="row-arrow" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, Search, FileText, ChevronRight } from '@lucide/vue'
import { usePurchaseOrderStore } from '@/stores/purchaseOrders'
import { useFormatters } from '@/composables/useFormatters'

const router = useRouter()
const store = usePurchaseOrderStore()
const { formatCurrency } = useFormatters()

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
</style>
