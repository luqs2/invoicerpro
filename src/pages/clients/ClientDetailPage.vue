<template>
  <div class="page">

    <div v-if="client">
      <!-- Header -->
      <div class="page-header">
        <div class="header-left">
          <router-link to="/app/clients" class="back-link">
            <ArrowLeft :size="16" />
            Clients
          </router-link>
          <div class="client-identity">
            <div class="avatar">{{ getInitials(client.name) }}</div>
            <div>
              <h1 class="page-title">{{ client.name }}</h1>
              <p class="page-sub">{{ client.email }}</p>
            </div>
          </div>
        </div>
        <div class="header-actions">
          <router-link to="/app/invoices/new" class="btn-primary">
            <Plus :size="14" />
            New Invoice
          </router-link>
          <UiButton variant="danger" @click="del" :loading="deleting">
            <Trash2 :size="14" />
            Delete
          </UiButton>
        </div>
      </div>

      <!-- Content grid -->
      <div class="detail-layout">

        <!-- Client info card -->
        <div class="info-card">
          <div class="card-header">
            <h2 class="card-title">Contact Details</h2>
          </div>
          <div class="card-body">
            <div class="info-row">
              <span class="info-label">Email</span>
              <a :href="`mailto:${client.email}`" class="info-value info-link">{{ client.email }}</a>
            </div>
            <div class="info-divider" />
            <div class="info-row" v-if="client.phone">
              <span class="info-label">Phone</span>
              <span class="info-value">{{ client.phone }}</span>
            </div>
            <template v-if="client.phone"><div class="info-divider" /></template>
            <div class="info-row" v-if="client.company">
              <span class="info-label">Company</span>
              <span class="info-value">{{ client.company }}</span>
            </div>
            <template v-if="client.company"><div class="info-divider" /></template>
            <div class="info-row" v-if="client.address">
              <span class="info-label">Address</span>
              <span class="info-value">{{ client.address }}</span>
            </div>
          </div>
        </div>

        <!-- Stats card -->
        <div class="stats-col">
          <div class="stat-card">
            <p class="stat-label">Member Since</p>
            <p class="stat-value">{{ formatDate(client.created_at) }}</p>
          </div>
        </div>

      </div>
    </div>

    <!-- Loading state -->
    <div v-else class="loading-state">
      <div class="loading-spinner" />
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Plus, Trash2 } from '@lucide/vue'
import { clientService } from '@/services/clients'
import { useClientStore } from '@/stores/clients'
import { useFormatters } from '@/composables/useFormatters'
import type { Client } from '@/types'
import UiButton from '@/components/ui/Button.vue'

const route  = useRoute()
const router = useRouter()
const store  = useClientStore()
const { getInitials, formatDate } = useFormatters()

const client   = ref<Client | null>(null)
const deleting = ref(false)

onMounted(async () => {
  const { data } = await clientService.getById(route.params.id as string)
  client.value = data
})

async function del() {
  if (!client.value) return
  deleting.value = true
  try {
    await store.remove(client.value.id)
    router.back()
  } finally {
    deleting.value = false
  }
}
</script>

<style scoped>
.page {
  padding: 32px 36px;
  max-width: 900px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Header */
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.header-left { display: flex; flex-direction: column; gap: 12px; }

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  text-decoration: none;
  transition: color .12s;
}
.back-link:hover { color: #6366f1; }

.client-identity {
  display: flex;
  align-items: center;
  gap: 16px;
}

.avatar {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 800;
  flex-shrink: 0;
}

.page-title { font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 2px; letter-spacing: -0.4px; }
.page-sub   { font-size: 14px; color: #64748b; margin: 0; }

.header-actions { display: flex; align-items: center; gap: 8px; }

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 9px 16px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #ffffff;
  border: none;
  border-radius: 9px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  transition: opacity .15s;
  box-shadow: 0 2px 8px rgba(99,102,241,.3);
  font-family: inherit;
}
.btn-primary:hover { opacity: .9; }

/* Content layout */
.detail-layout {
  display: grid;
  grid-template-columns: 1fr 220px;
  gap: 20px;
  align-items: start;
}

/* Info card */
.info-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  box-shadow: 0 1px 3px rgba(0,0,0,.05);
  overflow: hidden;
}

.card-header {
  padding: 14px 20px 12px;
  border-bottom: 1px solid #f1f5f9;
}

.card-title { font-size: 14px; font-weight: 700; color: #0f172a; margin: 0; }

.card-body {
  padding: 4px 0;
}

.info-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 13px 20px;
}

.info-label {
  font-size: 13px;
  color: #64748b;
  font-weight: 600;
  min-width: 90px;
  flex-shrink: 0;
}

.info-value {
  font-size: 14px;
  color: #0f172a;
  font-weight: 500;
  text-align: right;
}

.info-link {
  color: #6366f1;
  text-decoration: none;
}
.info-link:hover { text-decoration: underline; }

.info-divider {
  height: 1px;
  background: #f8fafc;
  margin: 0 20px;
}

/* Stats */
.stats-col { display: flex; flex-direction: column; gap: 12px; }

.stat-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,.05);
}

.stat-label {
  font-size: 11px;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 6px;
}

.stat-value {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

/* Loading */
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e2e8f0;
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin .7s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 768px) {
  .page { padding: 20px 16px; }
  .detail-layout { grid-template-columns: 1fr; }
  .page-header { flex-direction: column; }
  .header-actions { width: 100%; }
}
</style>
