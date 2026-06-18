<template>
  <div class="page">

    <!-- Page header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Clients</h1>
        <p class="page-sub">{{ store.clients.length }} client{{ store.clients.length !== 1 ? 's' : '' }}</p>
      </div>
      <button class="btn-primary" @click="openPanel()">
        <svg viewBox="0 0 24 24" fill="none" class="btn-icon">
          <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
          <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
        </svg>
        Add Client
      </button>
    </div>

    <!-- Search -->
    <div class="toolbar">
      <div class="search-wrap">
        <Search :size="15" class="search-icon" />
        <input
          class="search-input"
          v-model="search"
          placeholder="Search by name or email..."
        />
      </div>
    </div>

    <!-- Table skeleton -->
    <div class="section-card" v-if="store.loading">
      <div style="padding: 16px 20px;">
        <div v-for="i in 5" :key="i" style="display:flex; align-items:center; gap:12px; padding:14px 0; border-bottom:1px solid #f8fafc;">
          <Skeleton variant="rect" width="34px" height="34px" style="border-radius:8px; flex-shrink:0;" />
          <Skeleton variant="text" width="120px" />
          <Skeleton variant="text" width="140px" style="margin-left:auto;" />
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="section-card" v-else-if="filtered.length">
      <table class="data-table">
        <thead>
          <tr>
            <th>Client</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Company</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="c in filtered"
            :key="c.id"
            class="table-row"
            @click="$router.push(`/app/clients/${c.id}`)"
          >
            <td>
              <div class="client-cell">
                <div class="avatar">{{ getInitials(c.name) }}</div>
                <span class="client-name">{{ c.name }}</span>
              </div>
            </td>
            <td class="td-muted">{{ c.email }}</td>
            <td class="td-muted">{{ c.phone || '—' }}</td>
            <td>
              <span v-if="c.company" class="company-badge">{{ c.company }}</span>
              <span v-else class="td-muted">—</span>
            </td>
            <td class="td-action">
              <ChevronRight :size="14" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty -->
    <div class="empty-state" v-else>
      <Users :size="52" class="empty-icon" />
      <p class="empty-title">{{ search ? 'No matching clients' : 'No clients yet' }}</p>
      <p class="empty-sub">{{ search ? 'Try a different search.' : 'Add your first client to get started.' }}</p>
      <button v-if="!search" class="btn-primary" @click="openPanel()" style="margin-top:8px;">Add Client</button>
    </div>

    <!-- ── Add/Edit side panel ─────────────────────────── -->
    <transition name="panel-slide">
      <div v-if="panelOpen" class="panel-overlay" @click.self="closePanel">
        <div class="side-panel">
          <div class="panel-header">
            <h2 class="panel-title">Add Client</h2>
            <button class="panel-close" @click="closePanel" aria-label="Close panel">
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
            <UiButton @click="addClient" class="footer-btn">Save Client</UiButton>
          </div>
        </div>
      </div>
    </transition>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import { Search, X, Users, ChevronRight } from '@lucide/vue'
import { useClientStore } from '@/stores/clients'
import { useToast } from '@/composables/useToast'
import { useFormatters } from '@/composables/useFormatters'
import Skeleton from '@/components/ui/Skeleton.vue'
import UiInput from '@/components/ui/Input.vue'
import UiTextarea from '@/components/ui/Textarea.vue'
import UiButton from '@/components/ui/Button.vue'

const store = useClientStore()
const { showToast } = useToast()
const { getInitials } = useFormatters()

const search    = ref('')
const panelOpen = ref(false)
const form      = reactive({ name: '', email: '', phone: '', company: '', address: '' })

onMounted(() => store.fetchAll())

const filtered = computed(() =>
  store.clients.filter(c =>
    c.name.toLowerCase().includes(search.value.toLowerCase()) ||
    c.email.toLowerCase().includes(search.value.toLowerCase())
  )
)

function openPanel() { panelOpen.value = true }
function closePanel() { panelOpen.value = false }

async function addClient() {
  if (!form.name || !form.email) return showToast('Name and email required', 'danger')
  await store.create({ ...form })
  closePanel()
  showToast('Client added!')
  Object.assign(form, { name: '', email: '', phone: '', company: '', address: '' })
}
</script>

<style scoped>
.page {
  padding: 32px 36px;
  max-width: 1200px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Header */
.page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
}

.page-title {
  font-size: 26px;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 2px;
  letter-spacing: -0.5px;
}

.page-sub {
  font-size: 13px;
  color: #94a3b8;
  margin: 0;
  font-weight: 500;
}

/* Button */
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 9px 18px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #ffffff;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  transition: opacity .15s, transform .1s;
  box-shadow: 0 2px 10px rgba(99,102,241,.35);
  font-family: inherit;
  white-space: nowrap;
}
.btn-primary:hover { opacity: .9; }
.btn-primary:active { transform: scale(.98); }
.btn-icon { width: 16px; height: 16px; flex-shrink: 0; }

/* Toolbar */
.toolbar { display: flex; gap: 12px; align-items: center; }

.search-wrap {
  position: relative;
  min-width: 280px;
  max-width: 400px;
}
.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 16px;
  color: #94a3b8;
  pointer-events: none;
}
.search-input {
  width: 100%;
  height: 38px;
  padding: 0 14px 0 38px;
  border: 1.5px solid #e2e8f0;
  border-radius: 9px;
  font-size: 14px;
  color: #0f172a;
  background: #ffffff;
  outline: none;
  font-family: inherit;
  transition: border-color .15s, box-shadow .15s;
}
.search-input:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99,102,241,.1);
}
.search-input::placeholder { color: #94a3b8; }

/* Section card */
.section-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,.05);
  overflow: hidden;
}

/* Table */
.data-table { width: 100%; border-collapse: collapse; }
.data-table thead tr { border-bottom: 1px solid #f1f5f9; }
.data-table th {
  padding: 11px 16px 11px 20px;
  font-size: 11px;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  text-align: left;
  background: #fafafa;
}
.data-table td {
  padding: 14px 16px 14px 20px;
  font-size: 14px;
  color: #374151;
  border-bottom: 1px solid #f8fafc;
}
.table-row { cursor: pointer; transition: background .1s; }
.table-row:hover { background: #fafafa; }
.table-row:last-child td { border-bottom: none; }

.client-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar {
  width: 34px;
  height: 34px;
  min-width: 34px;
  border-radius: 8px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 800;
}

.client-name { font-weight: 600; color: #0f172a; }

.td-muted { color: #94a3b8; font-size: 13px; }
.td-action { color: #cbd5e1; font-size: 14px; width: 40px; text-align: right; }

.company-badge {
  display: inline-block;
  background: #f5f3ff;
  color: #6366f1;
  border-radius: 5px;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  letter-spacing: 0.3px;
}

/* Empty state */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80px 20px;
  gap: 8px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
}
.empty-icon  { font-size: 52px; color: #cbd5e1; margin-bottom: 4px; }
.empty-title { font-size: 16px; font-weight: 700; color: #374151; margin: 0; }
.empty-sub   { font-size: 14px; color: #94a3b8; margin: 0; text-align: center; max-width: 280px; }

/* ── Side panel ──────────────────────────────────────── */
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
  letter-spacing: -0.2px;
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
  font-size: 18px;
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

.field input,
.field textarea {
  padding: 10px 13px;
  border: 1.5px solid #e2e8f0;
  border-radius: 9px;
  font-size: 14px;
  color: #0f172a;
  background: #f8fafc;
  outline: none;
  font-family: inherit;
  resize: none;
  transition: border-color .15s, box-shadow .15s;
}
.field input:focus,
.field textarea:focus {
  border-color: #6366f1;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(99,102,241,.1);
}
.field input::placeholder,
.field textarea::placeholder { color: #94a3b8; }

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

/* Responsive */
@media (max-width: 768px) {
  .page { padding: 20px 16px; }
  .page-title { font-size: 20px; }
  .search-wrap { min-width: 0; max-width: 100%; flex: 1; }
  .side-panel { width: 100%; }
  .field-row { grid-template-columns: 1fr; }
  .data-table th:nth-child(3),
  .data-table th:nth-child(4),
  .data-table td:nth-child(3),
  .data-table td:nth-child(4) { display: none; }
}
</style>
