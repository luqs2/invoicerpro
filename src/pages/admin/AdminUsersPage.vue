<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Users, Search, Ban, Trash2, CheckCircle } from '@lucide/vue'
import Badge from '@/components/ui/Badge.vue'
import Pagination from '@/components/ui/Pagination.vue'
import Skeleton from '@/components/ui/Skeleton.vue'
import { getAllUsers, updateUserRole } from '@/services/admin'
import { usePermissions } from '@/composables/usePermissions'
import { useBreakpoint } from '@/composables/useBreakpoint'
import { useConfirm } from '@/composables/useConfirm'
import { useToast } from '@/composables/useToast'
import type { UserWithStats } from '@/types'

const { isMobile } = useBreakpoint()
const { canManageUsers, canBanUsers, canDeleteUsers } = usePermissions()
const { confirm } = useConfirm()
const { showToast } = useToast()

const router = useRouter()

const users = ref<UserWithStats[]>([])
const total = ref(0)
const loading = ref(true)
const search = ref('')
const page = ref(1)
const limit = 20
const roleSelects = ref<Record<string, HTMLSelectElement>>({})

const formatCurrency = (val: number) =>
  new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR', maximumFractionDigits: 0 }).format(val)

const roleBadgeClass = (role?: string): 'default' | 'sent' | 'warning' | 'danger' => {
  if (role === 'super_admin') return 'danger'
  if (role === 'admin') return 'warning'
  if (role === 'viewer') return 'sent'
  if (role === 'banned') return 'danger'
  return 'default'
}

async function fetchUsers() {
  loading.value = true
  try {
    const result = await getAllUsers({ page: page.value, limit, search: search.value })
    users.value = result.data
    total.value = result.total
  } finally {
    loading.value = false
  }
}

async function handleRoleChange(userId: string, newRole: string) {
  const prevRole = users.value.find(u => u.id === userId)?.role || 'user'
  const ok = await confirm({
    title: 'Change user role',
    message: `Change this user's role to "${newRole}"?`,
    confirmText: 'Change Role',
    variant: 'warning',
  })
  if (!ok) {
    // Reset select to previous value
    const el = roleSelects.value[userId]
    if (el) el.value = prevRole
    return
  }
  try {
    await updateUserRole(userId, newRole)
    showToast('User role updated')
    await fetchUsers()
  } catch (e: any) {
    showToast('Failed to update role: ' + e.message, 'danger')
  }
}

async function handleBanUser(userId: string, userName: string) {
  const ok = await confirm({
    title: 'Ban user',
    message: `Ban "${userName}"? They will not be able to access the platform.`,
    confirmText: 'Ban User',
    variant: 'danger',
  })
  if (!ok) return
  try {
    await updateUserRole(userId, 'banned')
    showToast('User has been banned')
    await fetchUsers()
  } catch (e: any) {
    showToast('Failed to ban user: ' + e.message, 'danger')
  }
}

async function handleUnbanUser(userId: string, userName: string) {
  const ok = await confirm({
    title: 'Unban user',
    message: `Unban "${userName}"? They will regain access to the platform.`,
    confirmText: 'Unban User',
    variant: 'info',
  })
  if (!ok) return
  try {
    await updateUserRole(userId, 'user')
    showToast('User has been unbanned')
    await fetchUsers()
  } catch (e: any) {
    showToast('Failed to unban user: ' + e.message, 'danger')
  }
}

async function handleDeleteUser(userId: string, userName: string) {
  const ok = await confirm({
    title: 'Delete user',
    message: `Permanently delete "${userName}"? This cannot be undone.`,
    confirmText: 'Delete',
    variant: 'danger',
  })
  if (!ok) return
  try {
    const { supabaseAdmin } = await import('@/services/supabase')
    const client = supabaseAdmin ?? (await import('@/services/supabase')).supabase
    const { error } = await client.auth.admin.deleteUser(userId)
    if (error) throw error
    showToast('User has been deleted')
    await fetchUsers()
  } catch (e: any) {
    showToast('Failed to delete user: ' + e.message, 'danger')
  }
}

let searchTimeout: ReturnType<typeof setTimeout>
function onSearch() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    page.value = 1
    fetchUsers()
  }, 300)
}

function onPageChange(newPage: number) {
  page.value = newPage
  fetchUsers()
}

onMounted(fetchUsers)
</script>

<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Users</h1>
        <p class="page-sub">{{ total }} registered users</p>
      </div>
    </div>

    <!-- Search -->
    <div class="toolbar">
      <div class="search-wrapper">
        <Search :size="16" class="search-icon" />
        <input
          v-model="search"
          type="text"
          placeholder="Search by name or email..."
          class="search-input"
          @input="onSearch"
        />
      </div>
    </div>

    <!-- Loading skeleton -->
    <div v-if="loading" class="section-card">
      <div v-for="i in 5" :key="i" class="skeleton-row">
        <Skeleton variant="circle" style="width: 32px; height: 32px;" />
        <Skeleton variant="text" style="width: 140px;" />
        <Skeleton variant="text" style="width: 100px;" />
        <Skeleton variant="text" style="width: 60px;" />
      </div>
    </div>

    <!-- Desktop table -->
    <div v-else-if="!isMobile" class="section-card">
      <table class="data-table">
        <thead>
          <tr>
            <th scope="col">User</th>
            <th scope="col">Role</th>
            <th scope="col">Invoices</th>
            <th scope="col">Revenue</th>
            <th scope="col">Joined</th>
            <th v-if="canManageUsers || canBanUsers || canDeleteUsers" scope="col" class="th-action">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="user in users"
            :key="user.id"
            class="table-row"
            @click="router.push(`/app/admin/users/${user.id}`)"
          >
            <td class="td-client">
              <div class="user-avatar">
                {{ user.full_name?.charAt(0)?.toUpperCase() || '?' }}
              </div>
              <div>
                <div class="td-bold">{{ user.full_name || 'Unnamed' }}</div>
                <div class="td-muted">{{ user.business_name || 'No business set' }}</div>
              </div>
            </td>
            <td>
              <Badge :variant="roleBadgeClass(user.role)">
                {{ user.role || 'user' }}
              </Badge>
            </td>
            <td class="td-mono">{{ user.invoice_count }}</td>
            <td class="td-mono td-bold">{{ formatCurrency(user.total_revenue) }}</td>
            <td class="td-muted">{{ user.created_at ? new Date(user.created_at).toLocaleDateString() : '-' }}</td>
            <td v-if="canManageUsers || canBanUsers || canDeleteUsers" class="td-actions" @click.stop>
              <div class="action-group">
                <select
                  v-if="canManageUsers"
                  :ref="el => { if (el) roleSelects[user.id] = el as HTMLSelectElement }"
                  :value="user.role || 'user'"
                  class="role-select"
                  @change="handleRoleChange(user.id, ($event.target as HTMLSelectElement).value)"
                >
                  <option value="user">User</option>
                  <option value="viewer">Viewer</option>
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
                <button
                  v-if="canBanUsers && user.role !== 'banned'"
                  class="action-icon-btn danger"
                  title="Ban user"
                  @click="handleBanUser(user.id, user.full_name || 'this user')"
                >
                  <Ban :size="14" />
                </button>
                <button
                  v-if="canBanUsers && user.role === 'banned'"
                  class="action-icon-btn success"
                  title="Unban user"
                  @click="handleUnbanUser(user.id, user.full_name || 'this user')"
                >
                  <CheckCircle :size="14" />
                </button>
                <button
                  v-if="canDeleteUsers"
                  class="action-icon-btn danger"
                  title="Delete user"
                  @click="handleDeleteUser(user.id, user.full_name || 'this user')"
                >
                  <Trash2 :size="14" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="users.length === 0" class="empty-state">
        <Users :size="40" class="empty-icon" />
        <p>No users found</p>
      </div>

      <Pagination
        v-if="total > limit"
        :current-page="page"
        :total="total"
        :page-size="limit"
        @update:current-page="onPageChange"
      />
    </div>

    <!-- Mobile cards -->
    <div v-else class="card-list">
      <div
        v-for="user in users"
        :key="user.id"
        class="user-card"
        @click="router.push(`/app/admin/users/${user.id}`)"
      >
        <div class="user-card-header">
          <div class="user-avatar">
            {{ user.full_name?.charAt(0)?.toUpperCase() || '?' }}
          </div>
          <div class="user-card-info">
            <div class="user-card-name">{{ user.full_name || 'Unnamed' }}</div>
            <div class="user-card-business">{{ user.business_name || 'No business set' }}</div>
          </div>
          <Badge :variant="roleBadgeClass(user.role)">{{ user.role || 'user' }}</Badge>
        </div>
        <div class="user-card-stats">
          <div class="user-card-stat">
            <span class="user-card-stat-label">Invoices</span>
            <span class="user-card-stat-value">{{ user.invoice_count }}</span>
          </div>
          <div class="user-card-stat">
            <span class="user-card-stat-label">Revenue</span>
            <span class="user-card-stat-value">{{ formatCurrency(user.total_revenue) }}</span>
          </div>
          <div class="user-card-stat">
            <span class="user-card-stat-label">Joined</span>
            <span class="user-card-stat-value">{{ user.created_at ? new Date(user.created_at).toLocaleDateString() : '-' }}</span>
          </div>
        </div>
        <div v-if="canManageUsers || canBanUsers || canDeleteUsers" class="user-card-actions" @click.stop>
          <div class="action-row">
            <select
              v-if="canManageUsers"
              :ref="el => { if (el) roleSelects[user.id] = el as HTMLSelectElement }"
              :value="user.role || 'user'"
              class="role-select"
              @change="handleRoleChange(user.id, ($event.target as HTMLSelectElement).value)"
            >
              <option value="user">User</option>
              <option value="viewer">Viewer</option>
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
            <button
              v-if="canBanUsers && user.role !== 'banned'"
              class="action-icon-btn danger"
              title="Ban user"
              @click="handleBanUser(user.id, user.full_name || 'this user')"
            >
              <Ban :size="14" />
            </button>
            <button
              v-if="canBanUsers && user.role === 'banned'"
              class="action-icon-btn success"
              title="Unban user"
              @click="handleUnbanUser(user.id, user.full_name || 'this user')"
            >
              <CheckCircle :size="14" />
            </button>
            <button
              v-if="canDeleteUsers"
              class="action-icon-btn danger"
              title="Delete user"
              @click="handleDeleteUser(user.id, user.full_name || 'this user')"
            >
              <Trash2 :size="14" />
            </button>
          </div>
        </div>
      </div>

      <div v-if="users.length === 0" class="empty-state">
        <Users :size="40" class="empty-icon" />
        <p>No users found</p>
      </div>

      <Pagination
        v-if="total > limit"
        :current-page="page"
        :total="total"
        :page-size="limit"
        @update:current-page="onPageChange"
      />
    </div>
  </div>
</template>

<style scoped>
.page { padding: 24px; }

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 24px;
}

.page-title {
  font-family: 'Merriweather', Georgia, serif;
  font-size: 24px;
  font-weight: 700;
  color: #1e1b15;
  margin: 0;
}
.dark .page-title { color: #e1e3e1; }

.page-sub {
  font-size: 14px;
  color: #414846;
  margin: 4px 0 0;
}
.dark .page-sub { color: #c0c8c4; }

.toolbar {
  margin-bottom: 16px;
}

.search-wrapper {
  position: relative;
  max-width: 400px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #414846;
}
.dark .search-icon { color: #c0c8c4; }

.search-input {
  width: 100%;
  padding: 9px 12px 9px 36px;
  border: 1px solid #D6D0C2;
  border-radius: 8px;
  font-size: 14px;
  background: #F7F4EC;
  color: #1e1b15;
  outline: none;
  transition: border-color 0.15s;
}
.dark .search-input { background: #1d201f; border-color: #404945; color: #e1e3e1; }
.search-input:focus { border-color: #B5652D; }

.section-card {
  background: #F7F4EC;
  border: 1px solid #D6D0C2;
  border-radius: 12px;
  padding: 0;
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
  padding: 12px 16px;
  font-size: 14px;
  color: #1e1b15;
  border-bottom: 1px solid #D6D0C2;
}
.dark .data-table td { color: #e1e3e1; border-color: #404945; }

.table-row { cursor: pointer; transition: background 0.12s; }
.table-row:hover { background: #EDE8DE; }
.dark .table-row:hover { background: #323534; }

.td-client { display: flex; align-items: center; gap: 10px; }

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #08241f;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
  flex-shrink: 0;
}

.td-bold { font-weight: 600; }
.td-muted { font-size: 12px; color: #414846; }
.dark .td-muted { color: #c0c8c4; }
.td-mono { font-family: 'JetBrains Mono', monospace; }

.th-action { text-align: right; }
.td-actions { text-align: right; }

.role-select {
  padding: 4px 8px;
  border: 1px solid #D6D0C2;
  border-radius: 6px;
  font-size: 12px;
  background: #F7F4EC;
  color: #1e1b15;
  cursor: pointer;
}
.dark .role-select { background: #1d201f; border-color: #404945; color: #e1e3e1; }

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #414846;
}
.dark .empty-state { color: #c0c8c4; }

.empty-icon { opacity: 0.4; margin-bottom: 8px; }

.skeleton-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid #D6D0C2;
}
.dark .skeleton-row { border-color: #404945; }

@media (max-width: 768px) {
  .page { padding: 16px; }
  .data-table { font-size: 13px; }
}

/* Mobile card list */
.card-list { display: flex; flex-direction: column; gap: 12px; }

.user-card {
  background: #F7F4EC; border: 1px solid #D6D0C2; border-radius: 14px;
  padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,.05); cursor: pointer;
  transition: box-shadow .15s;
}
.user-card:hover { box-shadow: 0 2px 8px rgba(0,0,0,.1); }
.dark .user-card { background: #1d201f; border-color: rgba(255,255,255,.05); }

.user-card-header {
  display: flex; align-items: center; gap: 12px; margin-bottom: 12px;
}

.user-card-info { flex: 1; min-width: 0; }

.user-card-name {
  font-size: 15px; font-weight: 700; color: #1e1b15;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.dark .user-card-name { color: #e1e3e1; }

.user-card-business {
  font-size: 12px; color: #8a8578;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.dark .user-card-business { color: #8a938f; }

.user-card-stats {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;
  padding: 12px 0; border-top: 1px solid #e8e3d8;
}
.dark .user-card-stats { border-color: rgba(255,255,255,.05); }

.user-card-stat { text-align: center; }

.user-card-stat-label {
  display: block; font-size: 10px; font-weight: 700; color: #8a8578;
  letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 2px;
}
.dark .user-card-stat-label { color: #8a938f; }

.user-card-stat-value {
  font-size: 14px; font-weight: 600; color: #1e1b15;
  font-family: 'JetBrains Mono', monospace;
}
.dark .user-card-stat-value { color: #e1e3e1; }

.user-card-actions {
  padding-top: 12px; border-top: 1px solid #e8e3d8;
}
.dark .user-card-actions { border-color: rgba(255,255,255,.05); }

.action-group { display: flex; align-items: center; gap: 6px; justify-content: flex-end; }
.action-row { display: flex; align-items: center; gap: 6px; }

.action-icon-btn {
  display: inline-flex; align-items: center; justify-content: center;
  width: 30px; height: 30px; border: 1px solid #D6D0C2; border-radius: 6px;
  background: #F7F4EC; color: #414846; cursor: pointer; transition: all 0.15s;
}
.dark .action-icon-btn { background: #1d201f; border-color: #404945; color: #c0c8c4; }
.action-icon-btn:hover { border-color: #B5652D; color: #B5652D; }
.action-icon-btn.danger:hover { border-color: #dc2626; color: #dc2626; background: #fee2e2; }
.dark .action-icon-btn.danger:hover { background: rgba(220,38,38,0.15); }
.action-icon-btn.success:hover { border-color: #16a34a; color: #16a34a; background: #d1fae5; }
.dark .action-icon-btn.success:hover { background: rgba(22,163,74,0.15); }
</style>
