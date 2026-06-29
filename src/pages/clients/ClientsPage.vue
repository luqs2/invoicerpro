<template>
  <div class="page">
    <!-- Page header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">
          Clients
        </h1>
        <p class="page-sub">
          {{ store.clients.length }} client{{ store.clients.length !== 1 ? 's' : '' }}
        </p>
      </div>
      <button
        class="btn-primary"
        @click="openPanel()"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          class="btn-icon"
        >
          <line
            x1="12"
            y1="5"
            x2="12"
            y2="19"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
          />
          <line
            x1="5"
            y1="12"
            x2="19"
            y2="12"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
          />
        </svg>
        Add Client
      </button>
    </div>

    <!-- Search -->
    <div class="toolbar">
      <div class="search-wrap">
        <Search
          :size="15"
          class="search-icon"
        />
        <input
          v-model="search"
          class="search-input"
          placeholder="Search by name or email..."
        >
      </div>
    </div>

    <!-- Table skeleton -->
    <div
      v-if="!fetched"
      class="section-card"
    >
      <div style="padding: 16px 20px;">
        <div
          v-for="i in 5"
          :key="i"
          style="display:flex; align-items:center; gap:12px; padding:14px 0; border-bottom:1px solid #f8fafc;"
        >
          <Skeleton
            variant="rect"
            width="34px"
            height="34px"
            style="border-radius:8px; flex-shrink:0;"
          />
          <Skeleton
            variant="text"
            width="120px"
          />
          <Skeleton
            variant="text"
            width="140px"
            style="margin-left:auto;"
          />
        </div>
      </div>
    </div>

    <!-- Table -->
    <div
      v-else-if="filtered.length"
      class="section-card"
    >
      <table
        class="data-table"
        aria-live="polite"
      >
        <thead>
          <tr>
            <th>Client</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Company</th>
            <th />
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="c in paginated"
            :key="c.id"
            class="table-row"
            @click="$router.push(`/app/clients/${c.id}`)"
          >
            <td>
              <div class="client-cell">
                <div class="avatar">
                  {{ getInitials(c.name) }}
                </div>
                <span class="client-name">{{ c.name }}</span>
              </div>
            </td>
            <td class="td-muted">
              {{ c.email }}
            </td>
            <td class="td-muted">
              {{ c.phone || '—' }}
            </td>
            <td>
              <span
                v-if="c.company"
                class="company-badge"
              >{{ c.company }}</span>
              <span
                v-else
                class="td-muted"
              >—</span>
            </td>
            <td class="td-action">
              <ChevronRight :size="14" />
            </td>
          </tr>
        </tbody>
      </table>
      <Pagination
        :current-page="currentPage"
        :total="filtered.length"
        :page-size="pageSize"
        @update:current-page="currentPage = $event"
        @update:page-size="pageSize = $event; currentPage = 1"
      />
    </div>

    <!-- Empty -->
    <div
      v-else-if="fetched"
      class="empty-state"
    >
      <Users
        :size="52"
        class="empty-icon"
      />
      <p class="empty-title">
        {{ search ? 'No matching clients' : 'No clients yet' }}
      </p>
      <p class="empty-sub">
        {{ search ? 'Try a different search.' : 'Add your first client to get started.' }}
      </p>
      <button
        v-if="!search"
        class="btn-primary"
        style="margin-top:8px;"
        @click="openPanel()"
      >
        Add Client
      </button>
    </div>

    <!-- ── Add/Edit side panel ─────────────────────────── -->
    <transition name="panel-slide">
      <div
        v-if="panelOpen"
        class="panel-overlay"
        @click.self="closePanel"
      >
        <div class="side-panel">
          <div class="panel-header">
            <h2 class="panel-title">
              Add Client
            </h2>
            <button
              class="panel-close"
              aria-label="Close panel"
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
              class="footer-btn"
              @click="addClient"
            >
              Save Client
            </UiButton>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive, watch } from 'vue'
import { Search, X, Users, ChevronRight } from '@lucide/vue'
import { useClientStore } from '@/stores/clients'
import { useToast } from '@/composables/useToast'
import { useFormatters } from '@/composables/useFormatters'
import { useMinDelay } from '@/composables/useMinDelay'
import Skeleton from '@/components/ui/Skeleton.vue'
import UiInput from '@/components/ui/Input.vue'
import UiTextarea from '@/components/ui/Textarea.vue'
import UiButton from '@/components/ui/Button.vue'
import Pagination from '@/components/ui/Pagination.vue'

const store = useClientStore()
const { showToast } = useToast()
const { getInitials } = useFormatters()
const { wrap } = useMinDelay()

const fetched    = ref(false)
const search    = ref('')
const panelOpen = ref(false)
const form      = reactive({ name: '', email: '', phone: '', company: '', address: '', attn: '' })
const currentPage = ref(1)
const pageSize = ref(10)

onMounted(async () => {
  await wrap(store.fetchAll())
  fetched.value = true
})

const filtered = computed(() =>
  store.clients.filter(c =>
    c.name.toLowerCase().includes(search.value.toLowerCase()) ||
    c.email.toLowerCase().includes(search.value.toLowerCase())
  )
)

const paginated = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filtered.value.slice(start, start + pageSize.value)
})

watch(search, () => {
  currentPage.value = 1
})

function openPanel() { panelOpen.value = true }
function closePanel() { panelOpen.value = false }

async function addClient() {
  if (!form.name || !form.email) return showToast('Name and email required', 'danger')
  await store.create({ ...form })
  closePanel()
  showToast('Client added!')
  Object.assign(form, { name: '', email: '', phone: '', company: '', address: '', attn: '' })
}
</script>

<style scoped>
/* Client-specific styles */
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

.panel-body .field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}

.panel-body .field label {
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

/* Responsive */
@media (max-width: 768px) {
  .search-wrap { min-width: 0; max-width: 100%; flex: 1; }
  .side-panel { width: 100%; }
}
</style>
