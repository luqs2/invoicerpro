<template>
  <div class="page">
    <div v-if="!loading && client">
      <!-- Back link -->
      <router-link
        to="/app/clients"
        class="back-link"
      >
        <ArrowLeft :size="16" />
        Clients
      </router-link>

      <!-- Header -->
      <div class="page-header">
        <div class="client-identity">
          <div class="avatar">
            {{ getInitials(client.name) }}
          </div>
          <div>
            <h1 class="page-title">
              {{ client.name }}
            </h1>
            <p class="page-sub">
              {{ client.email }}
            </p>
          </div>
        </div>
        <div class="header-actions">
          <router-link
            to="/app/invoices/new"
            class="btn-primary"
          >
            <Plus :size="14" />
            New Invoice
          </router-link>
          <UiButton
            variant="outline"
            @click="openEdit"
          >
            <Pencil :size="14" />
            Edit
          </UiButton>
          <UiButton
            variant="danger"
            :loading="deleting"
            @click="del"
          >
            <Trash2 :size="14" />
            Delete
          </UiButton>
        </div>
      </div>

      <!-- Stats row -->
      <div class="stats-row">
        <div class="stat-card">
          <div
            class="stat-icon"
            style="background:#cbe9e0;"
          >
            <Calendar
              :size="16"
              style="color:#08241f;"
            />
          </div>
          <div>
            <p class="stat-label">
              Member Since
            </p>
            <p class="stat-value">
              {{ formatDate(client.created_at) }}
            </p>
          </div>
        </div>
        <div class="stat-card">
          <div
            class="stat-icon"
            style="background:#d1fae5;"
          >
            <TrendingUp
              :size="16"
              style="color:#059669;"
            />
          </div>
          <div>
            <p class="stat-label">
              Total Revenue
            </p>
            <p class="stat-value">
              {{ formatCurrency(totalRevenue) }}
            </p>
          </div>
        </div>
        <div class="stat-card">
          <div
            class="stat-icon"
            :style="{ background: outstandingCount > 0 ? '#fee2e2' : '#f1f5f9' }"
          >
            <Clock
              :size="16"
              :style="{ color: outstandingCount > 0 ? '#ef4444' : '#64748b' }"
            />
          </div>
          <div>
            <p class="stat-label">
              Outstanding
            </p>
            <p
              class="stat-value"
              :class="{ 'stat-overdue': outstandingCount > 0 }"
            >
              {{ outstandingCount }}
            </p>
          </div>
        </div>
        <div class="stat-card">
          <div
            class="stat-icon"
            style="background:#dbeafe;"
          >
            <Wallet
              :size="16"
              style="color:#2563eb;"
            />
          </div>
          <div>
            <p class="stat-label">
              Total Received
            </p>
            <p class="stat-value">
              {{ formatCurrency(totalReceipts) }}
            </p>
          </div>
        </div>
      </div>

      <!-- Two-column content -->
      <div class="content-grid">
        <!-- Contact details -->
        <div class="info-card">
          <div class="card-header">
            <h2 class="card-title">
              Contact Details
            </h2>
          </div>
          <div class="card-body">
            <div class="info-row">
              <span class="info-label">Email</span>
              <a
                :href="`mailto:${client.email}`"
                class="info-value info-link"
              >{{ client.email }}</a>
            </div>
            <div class="info-divider" />
            <div
              v-if="client.phone"
              class="info-row"
            >
              <span class="info-label">Phone</span>
              <span class="info-value">{{ client.phone }}</span>
            </div>
            <div
              v-if="client.phone"
              class="info-divider"
            />
            <div
              v-if="client.company"
              class="info-row"
            >
              <span class="info-label">Company</span>
              <span class="info-value">{{ client.company }}</span>
            </div>
            <div
              v-if="client.company"
              class="info-divider"
            />
            <div
              v-if="client.address"
              class="info-row"
            >
              <span class="info-label">Address</span>
              <span class="info-value">{{ client.address }}</span>
            </div>
            <div
              v-if="client.address"
              class="info-divider"
            />
            <div
              v-if="client.attn"
              class="info-row"
            >
              <span class="info-label">Attention</span>
              <span class="info-value">{{ client.attn }}</span>
            </div>
          </div>
        </div>

        <!-- Invoices -->
        <div class="invoices-card">
          <div class="card-header">
            <h2 class="card-title">
              Invoices
            </h2>
            <router-link
              to="/app/invoices/new"
              class="card-link"
            >
              <Plus :size="14" />
              New
            </router-link>
          </div>
          <div
            v-if="invoices.length"
            class="invoices-list"
          >
            <router-link
              v-for="inv in invoices"
              :key="inv.id"
              :to="`/app/invoices/${inv.id}`"
              class="invoice-row"
            >
              <div class="inv-left">
                <FileText
                  :size="16"
                  class="inv-icon"
                />
                <div>
                  <p class="inv-number">
                    {{ inv.invoice_number }}
                  </p>
                  <p class="inv-date">
                    {{ formatDate(inv.issue_date) }}
                  </p>
                </div>
              </div>
              <div class="inv-right">
                <span class="inv-amount">{{ formatCurrency(inv.total, inv.currency) }}</span>
                <span
                  class="status-badge"
                  :class="`status-${inv.status}`"
                >{{ inv.status }}</span>
              </div>
            </router-link>
          </div>
          <div
            v-else
            class="card-empty"
          >
            <FileText
              :size="28"
              style="color:#cbd5e1;"
            />
            <p>No invoices yet</p>
          </div>
        </div>
      </div>

      <!-- Receipts -->
      <div
        v-if="receipts.length"
        class="invoices-card"
      >
        <div class="card-header">
          <h2 class="card-title">
            Receipts
          </h2>
          <router-link
            to="/app/receipts/new"
            class="card-link"
          >
            <Plus :size="14" />
            New
          </router-link>
        </div>
        <div class="invoices-list">
          <router-link
            v-for="r in receipts"
            :key="r.id"
            :to="`/app/receipts/${r.id}`"
            class="invoice-row"
          >
            <div class="inv-left">
              <DollarSign
                :size="16"
                class="inv-icon"
              />
              <div>
                <p class="inv-number">
                  {{ r.receipt_number }}
                </p>
                <p class="inv-date">
                  {{ formatDate(r.payment_date) }}
                </p>
              </div>
            </div>
            <div class="inv-right">
              <span class="inv-amount">{{ formatCurrency(r.amount, r.currency) }}</span>
            </div>
          </router-link>
        </div>
      </div>
    </div>

    <!-- Loading state -->
    <div v-else>
      <Skeleton
        variant="text"
        width="60px"
        style="margin-bottom:16px;"
      />
      <div class="page-header">
        <div class="client-identity">
          <Skeleton
            variant="rect"
            width="52px"
            height="52px"
            style="border-radius:14px; flex-shrink:0;"
          />
          <div style="display:flex; flex-direction:column; gap:6px;">
            <Skeleton
              variant="text"
              width="160px"
            />
            <Skeleton
              variant="text"
              width="200px"
            />
          </div>
        </div>
      </div>

      <div class="stats-row">
        <div
          v-for="i in 4"
          :key="i"
          class="stat-card"
        >
          <Skeleton
            variant="rect"
            width="32px"
            height="32px"
            style="border-radius:8px; flex-shrink:0;"
          />
          <div>
            <Skeleton
              variant="text"
              width="80px"
            />
            <Skeleton
              variant="text"
              width="60px"
              style="margin-top:4px;"
            />
          </div>
        </div>
      </div>

      <div class="content-grid">
        <div class="info-card">
          <div class="card-header">
            <Skeleton
              variant="text"
              width="110px"
            />
          </div>
          <div class="card-body">
            <div
              v-for="i in 3"
              :key="i"
              style="padding:13px 20px;"
            >
              <Skeleton
                variant="text"
                width="60px"
              />
              <Skeleton
                variant="text"
                width="180px"
                style="margin-top:4px;"
              />
            </div>
          </div>
        </div>
        <div class="invoices-card">
          <div class="card-header">
            <Skeleton
              variant="text"
              width="70px"
            />
          </div>
          <div>
            <div
              v-for="i in 3"
              :key="i"
              class="invoice-row"
            >
              <div class="inv-left">
                <Skeleton
                  variant="rect"
                  width="16px"
                  height="16px"
                  style="border-radius:4px;"
                />
                <div>
                  <Skeleton
                    variant="text"
                    width="100px"
                  />
                  <Skeleton
                    variant="text"
                    width="80px"
                  />
                </div>
              </div>
              <div class="inv-right">
                <Skeleton
                  variant="text"
                  width="80px"
                />
                <Skeleton
                  variant="text"
                  width="50px"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit side panel -->
    <transition name="panel-slide">
      <div
        v-if="panelOpen"
        class="panel-overlay"
        @click.self="closePanel"
      >
        <div class="side-panel">
          <div class="panel-header">
            <h2 class="panel-title">
              Edit Client
            </h2>
            <button
              class="panel-close"
              @click="closePanel"
            >
              <X :size="16" />
            </button>
          </div>

          <div class="panel-body">
            <div class="field">
              <label>Full Name <span class="req">*</span></label>
              <UiInput
                v-model="form.name"
                placeholder="Jane Smith"
              />
            </div>
            <div class="field">
              <label>Email <span class="req">*</span></label>
              <UiInput
                v-model="form.email"
                type="email"
                placeholder="jane@company.com"
              />
            </div>
            <div class="field-row">
              <div class="field">
                <label>Phone</label>
                <UiInput
                  v-model="form.phone"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
              <div class="field">
                <label>Company</label>
                <UiInput
                  v-model="form.company"
                  placeholder="Acme Corp"
                />
              </div>
            </div>
            <div class="field">
              <label>Address</label>
              <UiTextarea
                v-model="form.address"
                placeholder="123 Main St, City, Country"
                :rows="3"
              />
            </div>
            <div class="field">
              <label>Attention (Attn)</label>
              <UiInput
                v-model="form.attn"
                placeholder="Contact person name"
              />
            </div>
          </div>

          <div class="panel-footer">
            <UiButton
              variant="outline"
              class="footer-btn"
              @click="closePanel"
            >
              Cancel
            </UiButton>
            <UiButton
              :loading="saving"
              class="footer-btn"
              @click="saveEdit"
            >
              Save Changes
            </UiButton>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Plus, Trash2, Pencil, X, FileText, DollarSign, Calendar, TrendingUp, Clock, Wallet } from '@lucide/vue'
import { clientService } from '@/services/clients'
import { invoiceService } from '@/services/invoices'
import { receiptService } from '@/services/receipts'
import { useClientStore } from '@/stores/clients'
import { useFormatters } from '@/composables/useFormatters'
import { useToast } from '@/composables/useToast'
import { useConfirm } from '@/composables/useConfirm'
import { useMinDelay } from '@/composables/useMinDelay'
import type { Client, Invoice } from '@/types'
import UiButton from '@/components/ui/Button.vue'
import UiInput from '@/components/ui/Input.vue'
import UiTextarea from '@/components/ui/Textarea.vue'
import Skeleton from '@/components/ui/Skeleton.vue'

const route  = useRoute()
const router = useRouter()
const store  = useClientStore()
const { getInitials, formatDate, formatCurrency } = useFormatters()
const { showToast } = useToast()
const { confirm } = useConfirm()
const { loading, wrap } = useMinDelay()

const client    = ref<Client | null>(null)
const invoices  = ref<Invoice[]>([])
const receipts  = ref<any[]>([])
const deleting  = ref(false)
const panelOpen = ref(false)
const saving    = ref(false)

const totalRevenue = computed(() =>
  invoices.value.filter(i => i.status === 'paid').reduce((s, i) => s + i.total, 0)
)
const outstandingCount = computed(() =>
  invoices.value.filter(i => i.status === 'sent' || i.status === 'overdue').length
)
const totalReceipts = computed(() =>
  receipts.value.reduce((s, r) => s + Number(r.amount), 0)
)

const form = reactive({ name: '', email: '', phone: '', company: '', address: '', attn: '' })

onMounted(async () => {
  const clientId = route.params.id as string
  const [{ data }, { data: invData }, { data: rcpData }] = await wrap(Promise.all([
    clientService.getById(clientId),
    invoiceService.getByClientId(clientId),
    receiptService.getByClientId(clientId),
  ]))
  client.value = data
  invoices.value = invData ?? []
  receipts.value = rcpData ?? []
})

function openEdit() {
  if (!client.value) return
  form.name    = client.value.name
  form.email   = client.value.email
  form.phone   = client.value.phone   ?? ''
  form.company = client.value.company ?? ''
  form.address = client.value.address ?? ''
  form.attn    = client.value.attn    ?? ''
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
  const invoiceCount = invoices.value.length
  const ok = await confirm({
    title: `Delete ${client.value.name}?`,
    message: invoiceCount > 0
      ? `This client has ${invoiceCount} linked invoice${invoiceCount > 1 ? 's' : ''}. Deleting will orphan those records. This cannot be undone.`
      : 'This will permanently delete this client. This cannot be undone.',
    confirmText: 'Delete Client',
    variant: 'danger',
  })
  if (!ok) return
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
  padding-top: 40px;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  font-weight: 600;
  color: #414846;
  text-decoration: none;
  transition: color .12s;
  margin-bottom: 20px;
}
.back-link:hover { color: #08241f; }

.client-identity {
  display: flex;
  align-items: center;
  gap: 16px;
}

.avatar {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: linear-gradient(135deg, #08241f, #B5652D);
  color: #F7F4EC;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 800;
  flex-shrink: 0;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 28px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 9px 16px;
  background: linear-gradient(135deg, #08241f, #B5652D);
  color: #F7F4EC;
  border: none;
  border-radius: 9px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  transition: opacity .15s;
  box-shadow: 0 2px 8px rgba(99,102,241,.3);
  font-family: inherit;
  white-space: nowrap;
}
.btn-primary:hover { opacity: .9; }

/* Stats row */
.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-bottom: 24px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 14px;
  background: #F7F4EC;
  border: 1px solid #D6D0C2;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,.05);
}

.stat-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-label {
  font-size: 11px;
  font-weight: 700;
  color: #414846;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 4px;
}

.stat-value {
  font-size: 18px;
  font-weight: 700;
  color: #1e1b15;
  margin: 0;
  font-variant-numeric: tabular-nums;
}

.stat-overdue { color: #ef4444; }

/* Content grid */
.content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  align-items: start;
  margin-bottom: 24px;
}

.info-card,
.invoices-card {
  background: #F7F4EC;
  border: 1px solid #D6D0C2;
  border-radius: 14px;
  box-shadow: 0 1px 3px rgba(0,0,0,.05);
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 22px;
  border-bottom: 1px solid #f4ede3;
}

.card-title {
  font-size: 14px;
  font-weight: 700;
  color: #1e1b15;
  margin: 0;
}

.card-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  font-weight: 600;
  color: #08241f;
  text-decoration: none;
}
.card-link:hover { text-decoration: underline; }

.card-body { padding: 4px 0; }

.info-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 20px;
}

.info-label {
  font-size: 13px;
  color: #414846;
  font-weight: 600;
  min-width: 90px;
  flex-shrink: 0;
}

.info-value {
  font-size: 14px;
  color: #1e1b15;
  font-weight: 500;
  text-align: right;
}

.info-link {
  color: #08241f;
  text-decoration: none;
}
.info-link:hover { text-decoration: underline; }

.info-divider {
  height: 1px;
  background: #EDE8DE;
  margin: 0 20px;
}

.card-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 40px 20px;
}
.card-empty p {
  font-size: 13px;
  color: #414846;
  margin: 0;
}

.invoices-list { display: flex; flex-direction: column; }

.invoice-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  text-decoration: none;
  color: inherit;
  border-bottom: 1px solid #EDE8DE;
  transition: background .1s;
}
.invoice-row:last-child { border-bottom: none; }
.invoice-row:hover { background: #EDE8DE; }

.inv-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.inv-icon { color: #414846; flex-shrink: 0; }

.inv-number {
  font-size: 14px;
  font-weight: 700;
  color: #1e1b15;
  margin: 0;
  font-variant-numeric: tabular-nums;
}

.inv-date {
  font-size: 12px;
  color: #414846;
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
  color: #1e1b15;
  font-variant-numeric: tabular-nums;
}

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
  background: #F7F4EC;
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
  border-bottom: 1px solid #f4ede3;
  flex-shrink: 0;
}

.panel-title {
  font-size: 18px;
  font-weight: 700;
  color: #1e1b15;
  margin: 0;
}

.panel-close {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: #f4ede3;
  border-radius: 8px;
  cursor: pointer;
  color: #414846;
  transition: background .12s;
}
.panel-close:hover { background: #D6D0C2; color: #1e1b15; }

.panel-body {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.panel-footer {
  display: flex;
  gap: 10px;
  padding: 16px 24px;
  border-top: 1px solid #f4ede3;
  flex-shrink: 0;
}

.footer-btn { flex: 1; justify-content: center; }

.panel-slide-enter-active,
.panel-slide-leave-active { transition: opacity .2s; }
.panel-slide-enter-active .side-panel,
.panel-slide-leave-active .side-panel { transition: transform .25s cubic-bezier(.32,0,.67,0); }
.panel-slide-enter-from,
.panel-slide-leave-to { opacity: 0; }
.panel-slide-enter-from .side-panel,
.panel-slide-leave-to .side-panel { transform: translateX(100%); }

@media (max-width: 1024px) {
  .stats-row { grid-template-columns: repeat(2, 1fr); }
  .content-grid { grid-template-columns: 1fr; }
}

@media (max-width: 768px) {
  .page { padding-top: 24px; }
  .page-header { flex-direction: column; align-items: flex-start; }
  .header-actions { width: 100%; flex-wrap: wrap; }
  .stats-row { grid-template-columns: 1fr 1fr; gap: 12px; }
  .content-grid { gap: 16px; }
  .side-panel { width: 100%; }
}

@media (max-width: 480px) {
  .stats-row { grid-template-columns: 1fr; }
}
</style>
