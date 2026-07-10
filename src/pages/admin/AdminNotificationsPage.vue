<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Bell, Send, Trash2, Megaphone } from '@lucide/vue'
import Badge from '@/components/ui/Badge.vue'
import Pagination from '@/components/ui/Pagination.vue'
import { createNotification, getNotifications, createNews, getAllNews, publishNews, unpublishNews, deleteNews } from '@/services/admin'
import { usePermissions } from '@/composables/usePermissions'
import { useConfirm } from '@/composables/useConfirm'
import { useToast } from '@/composables/useToast'
import type { Notification, News } from '@/types'

const { canSendNotifications, canManageNews } = usePermissions()
const { confirm } = useConfirm()
const { showToast } = useToast()

const loading = ref(true)
const notifications = ref<Notification[]>([])
const newsList = ref<News[]>([])
const totalNotifications = ref(0)
const totalNews = ref(0)
const page = ref(1)
const limit = 20
const activeTab = ref('notifications')

// Notification form
const showComposer = ref(false)
const composing = ref(false)
const notifForm = ref({
  title: '',
  body: '',
  type: 'info' as string,
  target_users: 'all',
  send_email: false,
})

// News form
const showNewsForm = ref(false)
const savingNews = ref(false)
const newsForm = ref({
  title: '',
  content: '',
  category: 'general',
})

const typeBadgeClass = (type: string): 'default' | 'sent' | 'warning' | 'danger' => {
  const map: Record<string, 'default' | 'sent' | 'warning' | 'danger'> = { info: 'sent', warning: 'warning', announcement: 'danger' }
  return map[type] || 'default'
}

async function fetchNotifications() {
  loading.value = true
  try {
    const result = await getNotifications({ page: page.value, limit })
    notifications.value = result.data
    totalNotifications.value = result.total
  } finally {
    loading.value = false
  }
}

async function fetchNews() {
  loading.value = true
  try {
    const result = await getAllNews({ page: page.value, limit })
    newsList.value = result.data
    totalNews.value = result.total
  } finally {
    loading.value = false
  }
}

async function sendNotification() {
  if (!notifForm.value.title || !notifForm.value.body) return
  composing.value = true
  try {
    await createNotification(notifForm.value)
    showComposer.value = false
    notifForm.value = { title: '', body: '', type: 'info', target_users: 'all', send_email: false }
    showToast('Notification sent successfully')
    await fetchNotifications()
  } catch (e: any) {
    showToast('Failed to send notification: ' + e.message, 'danger')
  } finally {
    composing.value = false
  }
}

async function saveNews() {
  if (!newsForm.value.title || !newsForm.value.content) return
  savingNews.value = true
  try {
    await createNews(newsForm.value)
    showNewsForm.value = false
    newsForm.value = { title: '', content: '', category: 'general' }
    showToast('News post created')
    await fetchNews()
  } catch (e: any) {
    showToast('Failed to create news: ' + e.message, 'danger')
  } finally {
    savingNews.value = false
  }
}

async function togglePublish(news: News) {
  try {
    if (news.is_published) {
      await unpublishNews(news.id)
      showToast('News post unpublished')
    } else {
      await publishNews(news.id)
      showToast('News post published')
    }
    await fetchNews()
  } catch (e: any) {
    showToast('Failed to update news: ' + e.message, 'danger')
  }
}

async function removeNews(id: string) {
  const ok = await confirm({
    title: 'Delete news post',
    message: 'Are you sure you want to delete this news post? This cannot be undone.',
    confirmText: 'Delete',
    variant: 'danger',
  })
  if (!ok) return
  try {
    await deleteNews(id)
    showToast('News post deleted')
    await fetchNews()
  } catch (e: any) {
    showToast('Failed to delete news: ' + e.message, 'danger')
  }
}

function onPageChange(p: number) {
  page.value = p
  if (activeTab.value === 'notifications') fetchNotifications()
  else fetchNews()
}

function switchTab(tab: string) {
  activeTab.value = tab
  page.value = 1
  if (tab === 'notifications') fetchNotifications()
  else fetchNews()
}

onMounted(fetchNotifications)
</script>

<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Notifications & News</h1>
        <p class="page-sub">Manage content delivery to users</p>
      </div>
    </div>

    <!-- Tabs -->
    <div class="tabs-bar">
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'notifications' }"
        @click="switchTab('notifications')"
      >
        <Bell :size="16" />
        Notifications
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'news' }"
        @click="switchTab('news')"
      >
        <Megaphone :size="16" />
        News
      </button>
    </div>

    <!-- Notifications tab -->
    <template v-if="activeTab === 'notifications'">
      <div v-if="canSendNotifications" class="toolbar">
        <button class="btn-primary" @click="showComposer = true">
          <Send :size="16" />
          Send Notification
        </button>
      </div>

      <div class="section-card">
        <table class="data-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Type</th>
              <th>Target</th>
              <th>Email</th>
              <th>Sent</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="n in notifications" :key="n.id" class="table-row">
              <td class="td-bold">{{ n.title }}</td>
              <td><Badge :variant="typeBadgeClass(n.type)">{{ n.type }}</Badge></td>
              <td>{{ n.target_users === 'all' ? 'All users' : 'Specific users' }}</td>
              <td>{{ n.send_email ? 'Yes' : 'No' }}</td>
              <td class="td-muted">{{ new Date(n.created_at).toLocaleDateString() }}</td>
            </tr>
          </tbody>
        </table>

        <div v-if="notifications.length === 0 && !loading" class="empty-state">
          <Bell :size="40" class="empty-icon" />
          <p>No notifications sent yet</p>
        </div>

        <Pagination v-if="totalNotifications > limit" :current-page="page" :total="totalNotifications" :page-size="limit" @update:current-page="onPageChange" />
      </div>
    </template>

    <!-- News tab -->
    <template v-if="activeTab === 'news'">
      <div v-if="canManageNews" class="toolbar">
        <button class="btn-primary" @click="showNewsForm = true">
          <Megaphone :size="16" />
          Create News Post
        </button>
      </div>

      <div class="section-card">
        <table class="data-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Status</th>
              <th>Created</th>
              <th v-if="canManageNews" class="th-action">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="news in newsList" :key="news.id" class="table-row">
              <td class="td-bold">{{ news.title }}</td>
              <td><Badge variant="default">{{ news.category }}</Badge></td>
              <td>
                <Badge :variant="news.is_published ? 'paid' : 'default'">
                  {{ news.is_published ? 'Published' : 'Draft' }}
                </Badge>
              </td>
              <td class="td-muted">{{ new Date(news.created_at).toLocaleDateString() }}</td>
              <td v-if="canManageNews" class="td-actions">
                <button class="action-btn" @click.stop="togglePublish(news)">
                  {{ news.is_published ? 'Unpublish' : 'Publish' }}
                </button>
                <button class="action-btn danger" @click.stop="removeNews(news.id)">
                  <Trash2 :size="14" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="newsList.length === 0 && !loading" class="empty-state">
          <Megaphone :size="40" class="empty-icon" />
          <p>No news posts yet</p>
        </div>

        <Pagination v-if="totalNews > limit" :current-page="page" :total="totalNews" :page-size="limit" @update:current-page="onPageChange" />
      </div>
    </template>

    <!-- Notification Composer Dialog -->
    <teleport to="body">
      <transition name="modal-fade">
        <div v-if="showComposer" class="modal-overlay" @click.self="showComposer = false">
          <div class="modal">
            <h2 class="modal-title">Send Notification</h2>
            <div class="modal-body">
              <div class="field">
                <label class="field-label">Title</label>
                <input v-model="notifForm.title" type="text" class="field-input" placeholder="Notification title" />
              </div>
              <div class="field">
                <label class="field-label">Body</label>
                <textarea v-model="notifForm.body" class="field-textarea" placeholder="Notification message..." rows="4" />
              </div>
              <div class="field-row">
                <div class="field">
                  <label class="field-label">Type</label>
                  <select v-model="notifForm.type" class="field-select">
                    <option value="info">Info</option>
                    <option value="warning">Warning</option>
                    <option value="announcement">Announcement</option>
                  </select>
                </div>
                <div class="field">
                  <label class="field-label">Target</label>
                  <select v-model="notifForm.target_users" class="field-select">
                    <option value="all">All users</option>
                  </select>
                </div>
              </div>
              <div class="field">
                <label class="checkbox-label">
                  <input v-model="notifForm.send_email" type="checkbox" class="checkbox" />
                  Also send via email
                </label>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn-outline" @click="showComposer = false">Cancel</button>
              <button class="btn-primary" :disabled="composing || !notifForm.title || !notifForm.body" @click="sendNotification">
                {{ composing ? 'Sending...' : 'Send' }}
              </button>
            </div>
          </div>
        </div>
      </transition>
    </teleport>

    <!-- News Form Dialog -->
    <teleport to="body">
      <transition name="modal-fade">
        <div v-if="showNewsForm" class="modal-overlay" @click.self="showNewsForm = false">
          <div class="modal">
            <h2 class="modal-title">Create News Post</h2>
            <div class="modal-body">
              <div class="field">
                <label class="field-label">Title</label>
                <input v-model="newsForm.title" type="text" class="field-input" placeholder="News title" />
              </div>
              <div class="field">
                <label class="field-label">Content</label>
                <textarea v-model="newsForm.content" class="field-textarea" placeholder="Write your news content..." rows="6" />
              </div>
              <div class="field">
                <label class="field-label">Category</label>
                <select v-model="newsForm.category" class="field-select">
                  <option value="general">General</option>
                  <option value="update">Update</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="feature">Feature</option>
                </select>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn-outline" @click="showNewsForm = false">Cancel</button>
              <button class="btn-primary" :disabled="savingNews || !newsForm.title || !newsForm.content" @click="saveNews">
                {{ savingNews ? 'Saving...' : 'Create' }}
              </button>
            </div>
          </div>
        </div>
      </transition>
    </teleport>
  </div>
</template>

<style scoped>
.page { padding: 24px; }
.page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; }
.page-title { font-family: 'Merriweather', Georgia, serif; font-size: 24px; font-weight: 700; color: #1e1b15; margin: 0; }
.dark .page-title { color: #e1e3e1; }
.page-sub { font-size: 14px; color: #414846; margin: 4px 0 0; }
.dark .page-sub { color: #c0c8c4; }

.tabs-bar { display: flex; gap: 4px; margin-bottom: 20px; background: #F7F4EC; border: 1px solid #D6D0C2; border-radius: 10px; padding: 4px; }
.dark .tabs-bar { background: #1d201f; border-color: #404945; }

.tab-btn {
  display: flex; align-items: center; gap: 6px; padding: 8px 16px; border: none; border-radius: 8px;
  font-size: 13px; font-weight: 500; background: transparent; color: #414846; cursor: pointer; transition: all 0.15s;
}
.dark .tab-btn { color: #c0c8c4; }
.tab-btn.active { background: #fff; color: #1e1b15; font-weight: 600; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
.dark .tab-btn.active { background: #323534; color: #e1e3e1; }

.toolbar { display: flex; justify-content: flex-end; margin-bottom: 16px; }

.btn-primary {
  display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border: none; border-radius: 8px;
  font-size: 13px; font-weight: 600; background: #08241f; color: #fff; cursor: pointer; transition: all 0.15s;
}
.btn-primary:hover { background: #0a3028; }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-outline {
  display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border: 1px solid #D6D0C2; border-radius: 8px;
  font-size: 13px; font-weight: 500; background: #F7F4EC; color: #1e1b15; cursor: pointer;
}
.dark .btn-outline { background: #1d201f; border-color: #404945; color: #e1e3e1; }

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

.th-action { text-align: right; }
.td-actions { text-align: right; display: flex; gap: 6px; justify-content: flex-end; }

.td-bold { font-weight: 600; }
.td-muted { font-size: 12px; color: #414846; }
.dark .td-muted { color: #c0c8c4; }

.action-btn {
  padding: 4px 10px; border: 1px solid #D6D0C2; border-radius: 6px; font-size: 12px; font-weight: 500;
  background: #F7F4EC; color: #1e1b15; cursor: pointer; transition: all 0.15s;
}
.dark .action-btn { background: #1d201f; border-color: #404945; color: #e1e3e1; }
.action-btn:hover { border-color: #B5652D; color: #B5652D; }
.action-btn.danger:hover { border-color: #dc2626; color: #dc2626; }

.empty-state { text-align: center; padding: 40px 20px; color: #414846; }
.dark .empty-state { color: #c0c8c4; }
.empty-icon { opacity: 0.4; margin-bottom: 8px; }

/* Modal */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 200;
  display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px);
}

.modal {
  background: #F7F4EC; border: 1px solid #D6D0C2; border-radius: 16px; width: 480px; max-width: 90vw;
  max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.15);
}
.dark .modal { background: #1d201f; border-color: #404945; }

.modal-title { font-family: 'Merriweather', Georgia, serif; font-size: 18px; font-weight: 700; color: #1e1b15; margin: 0; padding: 20px 24px 0; }
.dark .modal-title { color: #e1e3e1; }

.modal-body { padding: 20px 24px; }

.modal-footer { display: flex; justify-content: flex-end; gap: 8px; padding: 16px 24px; border-top: 1px solid #D6D0C2; }
.dark .modal-footer { border-color: #404945; }

.field { margin-bottom: 16px; }
.field-label { display: block; font-size: 13px; font-weight: 600; color: #1e1b15; margin-bottom: 6px; }
.dark .field-label { color: #e1e3e1; }

.field-input, .field-textarea, .field-select {
  width: 100%; padding: 9px 12px; border: 1px solid #D6D0C2; border-radius: 8px;
  font-size: 14px; background: #fff; color: #1e1b15; outline: none;
}
.dark .field-input, .dark .field-textarea, .dark .field-select { background: #323534; border-color: #404945; color: #e1e3e1; }
.field-input:focus, .field-textarea:focus, .field-select:focus { border-color: #B5652D; }
.field-textarea { resize: vertical; font-family: inherit; }

.field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

.checkbox-label { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #1e1b15; cursor: pointer; }
.dark .checkbox-label { color: #e1e3e1; }
.checkbox { width: 16px; height: 16px; accent-color: #B5652D; }

.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.2s; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
</style>
