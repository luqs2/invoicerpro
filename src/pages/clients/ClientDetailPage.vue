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
          <UiButton variant="outline" @click="openEdit">
            <Pencil :size="14" />
            Edit
          </UiButton>
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

      <!-- Invoices section -->
      <div class="invoices-section" v-if="invoices.length">
        <div class="section-header">
          <h2 class="section-title">Invoices</h2>
          <router-link to="/app/invoices/new" class="section-link">
            <Plus :size="14" />
            New
          </router-link>
        </div>
        <div class="invoices-list">
          <router-link
            v-for="inv in invoices"
            :key="inv.id"
            :to="`/app/invoices/${inv.id}`"
            class="invoice-row"
          >
            <div class="inv-left">
              <FileText :size="16" class="inv-icon" />
              <div>
                <p class="inv-number">{{ inv.invoice_number }}</p>
                <p class="inv-date">{{ formatDate(inv.issue_date) }}</p>
              </div>
            </div>
            <div class="inv-right">
              <span class="inv-amount">{{ formatCurrency(inv.total, inv.currency) }}</span>
              <span class="status-badge" :class="`status-${inv.status}`">{{ inv.status }}</span>
            </div>
          </router-link>
        </div>
      </div>
    </div>

    <!-- Loading state -->
    <div v-else class="loading-state">
      <div class="loading-spinner" />
    </div>

    <!-- Edit side panel -->
    <transition name="panel-slide">
      <div v-if="panelOpen" class="panel-overlay" @click.self="closePanel">
        <div class="side-panel">
          <div class="panel-header">
            <h2 class="panel-title">Edit Client</h2>
            <button class="panel-close" @click="closePanel">
              <X :size="16" />
            </button>
          </div>

          <div class="panel-body">
            <div class="field">
              <label>Full Name <span class="req">*</span></label>
              <UiInput v-model="form.name" placeholder="Jane Smith" />
            </div>
            <div class="field">
              <label>Email <span class="req">*</span></label>
              <UiInput v-model="form.email" type="email" placeholder="jane@company.com" />
            </div>
            <div class="field-row">
              <div class="field">
                <label>Phone</label>
                <UiInput v-model="form.phone" placeholder="+1 (555) 000-0000" />
              </div>
              <div class="field">
                <label>Company</label>
                <UiInput v-model="form.company" placeholder="Acme Corp" />
              </div>
            </div>
            <div class="field">
              <label>Address</label>
              <UiTextarea v-model="form.address" placeholder="123 Main St, City, Country" :rows="3" />
            </div>
          </div>

          <div class="panel-footer">
            <UiButton variant="outline" @click="closePanel" class="footer-btn">Cancel</UiButton>
            <UiButton @click="saveEdit" :loading="saving" class="footer-btn">Save Changes</UiButton>
          </div>
        </div>
      </div>
    </transition>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Plus, Trash2, Pencil, X, FileText } from '@lucide/vue'
import { clientService } from '@/services/clients'
import { invoiceService } from '@/services/invoices'
import { useClientStore } from '@/stores/clients'
import { useFormatters } from '@/composables/useFormatters'
import { useToast } from '@/composables/useToast'
import type { Client, Invoice } from '@/types'
import UiButton from '@/components/ui/Button.vue'
import UiInput from '@/components/ui/Input.vue'
import UiTextarea from '@/components/ui/Textarea.vue'

const route  = useRoute()
const router = useRouter()
const store  = useClientStore()
const { getInitials, formatDate, formatCurrency } = useFormatters()
const { showToast } = useToast()

const client    = ref<Client | null>(null)
const invoices  = ref<Invoice[]>([])
const deleting  = ref(false)
const panelOpen = ref(false)
const saving    = ref(false)

const form = reactive({ name: '', email: '', phone: '', company: '', address: '' })

onMounted(async () => {
  const clientId = route.params.id as string
  const [{ data }, { data: invData }] = await Promise.all([
    clientService.getById(clientId),
    invoiceService.getByClientId(clientId),
  ])
  client.value = data
  invoices.value = invData ?? []
})

function openEdit() {
  if (!client.value) return
  form.name    = client.value.name
  form.email   = client.value.email
  form.phone   = client.value.phone   ?? ''
  form.company = client.value.company ?? ''
  form.address = client.value.address ?? ''
  panelOpen.value = true
}

function closePanel() {
  panelOpen.value = false
}

async function saveEdit() {
  if (!client.value) return
  if (!form.name || !form.email) {
    showToast('Name and email are required', 'danger')
    return
  }
  saving.value = true
  try {
    await store.update(client.value.id, { ...form })
    client.value = { ...client.value, ...form }
    closePanel()
    showToast('Client updated!')
  } catch (err: any) {
    showToast(err?.message ?? 'Failed to update client', 'danger')
  } finally {
    saving.value = false
  }
}

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

/* Invoices section */
.invoices-section {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  box-shadow: 0 1px 3px rgba(0,0,0,.05);
  overflow: hidden;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #f1f5f9;
}

.section-title {
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.section-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  font-weight: 600;
  color: #6366f1;
  text-decoration: none;
}
.section-link:hover { text-decoration: underline; }

.invoices-list { display: flex; flex-direction: column; }

.invoice-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  text-decoration: none;
  color: inherit;
  border-bottom: 1px solid #f8fafc;
  transition: background .1s;
}
.invoice-row:last-child { border-bottom: none; }
.invoice-row:hover { background: #fafafa; }

.inv-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.inv-icon { color: #94a3b8; flex-shrink: 0; }

.inv-number {
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
  font-variant-numeric: tabular-nums;
}

.inv-date {
  font-size: 12px;
  color: #94a3b8;
  margin: 0;
}

.inv-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.inv-amount {
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
  font-variant-numeric: tabular-nums;
}

.status-badge {
  display: inline-block;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: 6px;
  text-transform: capitalize;
  letter-spacing: 0.2px;
}
.status-draft    { background: #f1f5f9; color: #64748b; }
.status-sent     { background: #dbeafe; color: #1d4ed8; }
.status-paid     { background: #d1fae5; color: #065f46; }
.status-overdue  { background: #fee2e2; color: #991b1b; }
.status-cancelled{ background: #f1f5f9; color: #94a3b8; }

/* Side panel */
.panel-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.3);
  z-index: 200;
  display: flex;
  justify-content: flex-end;
}

.side-panel {
  width: 440px;
  background: #ffffff;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-shadow: -4px 0 32px rgba(0,0,0,.12);
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #f1f5f9;
  flex-shrink: 0;
}

.panel-title {
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.panel-close {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: #f1f5f9;
  border-radius: 8px;
  cursor: pointer;
  color: #64748b;
  transition: background .12s;
}
.panel-close:hover { background: #e2e8f0; color: #0f172a; }

.panel-body {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}

.field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.field label {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}

.req { color: #ef4444; }

.panel-footer {
  display: flex;
  gap: 10px;
  padding: 16px 24px;
  border-top: 1px solid #f1f5f9;
  flex-shrink: 0;
}

.footer-btn { flex: 1; justify-content: center; }

/* Panel transition */
.panel-slide-enter-active,
.panel-slide-leave-active { transition: opacity .2s; }
.panel-slide-enter-active .side-panel,
.panel-slide-leave-active .side-panel { transition: transform .25s cubic-bezier(.32,0,.67,0); }
.panel-slide-enter-from,
.panel-slide-leave-to { opacity: 0; }
.panel-slide-enter-from .side-panel,
.panel-slide-leave-to .side-panel { transform: translateX(100%); }

@media (max-width: 768px) {
  .page { padding: 20px 16px; }
  .detail-layout { grid-template-columns: 1fr; }
  .page-header { flex-direction: column; }
  .header-actions { width: 100%; flex-wrap: wrap; }
  .side-panel { width: 100%; }
  .field-row { grid-template-columns: 1fr; }
}
</style>
