<script setup lang="ts">
import { onMounted } from 'vue'
import { Bell, CheckCheck, Info, AlertTriangle, Megaphone } from '@lucide/vue'
import { useNotificationStore } from '@/stores/notifications'

const notificationStore = useNotificationStore()

const typeIcon = (type: string) => {
  if (type === 'warning') return AlertTriangle
  if (type === 'announcement') return Megaphone
  return Info
}

const typeColor = (type: string) => {
  if (type === 'warning') return '#d97706'
  if (type === 'announcement') return '#dc2626'
  return '#0ea5e9'
}

function isUnread(n: any) {
  // Simplified: if no is_read_by data, consider unread
  return !n.is_read_by || (Array.isArray(n.is_read_by) && n.is_read_by.length === 0)
}

async function markRead(id: string) {
  await notificationStore.markAsRead(id)
}

async function markAllRead() {
  await notificationStore.markAllAsRead()
}

onMounted(() => {
  notificationStore.fetchNotifications()
})
</script>

<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Notifications</h1>
        <p class="page-sub">Stay updated with platform announcements</p>
      </div>
      <button
        v-if="notificationStore.notifications.length > 0"
        class="btn-ghost"
        @click="markAllRead"
      >
        <CheckCheck :size="16" />
        Mark all as read
      </button>
    </div>

    <!-- Loading -->
    <div v-if="notificationStore.loading" class="notification-list">
      <div v-for="i in 5" :key="i" class="notification-card skeleton-card">
        <div class="skeleton" style="width: 40px; height: 40px; border-radius: 10px;" />
        <div style="flex: 1;">
          <div class="skeleton" style="width: 200px; height: 16px; margin-bottom: 8px;" />
          <div class="skeleton" style="width: 300px; height: 14px;" />
        </div>
      </div>
    </div>

    <!-- Notifications list -->
    <div v-else class="notification-list">
      <div
        v-for="n in notificationStore.notifications"
        :key="n.id"
        class="notification-card"
        :class="{ unread: isUnread(n) }"
        @click="markRead(n.id)"
      >
        <div class="notif-icon" :style="{ background: typeColor(n.type) + '15', color: typeColor(n.type) }">
          <component :is="typeIcon(n.type)" :size="20" />
        </div>
        <div class="notif-content">
          <div class="notif-header">
            <h3 class="notif-title">{{ n.title }}</h3>
            <span class="notif-time">{{ new Date(n.created_at).toLocaleDateString() }}</span>
          </div>
          <p class="notif-body">{{ n.body }}</p>
        </div>
      </div>

      <div v-if="notificationStore.notifications.length === 0" class="empty-state">
        <Bell :size="48" class="empty-icon" />
        <h3 class="empty-title">No notifications</h3>
        <p class="empty-text">You're all caught up! Notifications from admins will appear here.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page { padding: 24px; max-width: 800px; }

.page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; }
.page-title { font-family: 'Merriweather', Georgia, serif; font-size: 24px; font-weight: 700; color: #1e1b15; margin: 0; }
.dark .page-title { color: #e1e3e1; }
.page-sub { font-size: 14px; color: #414846; margin: 4px 0 0; }
.dark .page-sub { color: #c0c8c4; }

.btn-ghost {
  display: inline-flex; align-items: center; gap: 6px; padding: 8px 12px; border: none; border-radius: 8px;
  font-size: 13px; font-weight: 500; background: transparent; color: #414846; cursor: pointer; transition: all 0.15s;
}
.dark .btn-ghost { color: #c0c8c4; }
.btn-ghost:hover { background: #EDE8DE; color: #1e1b15; }
.dark .btn-ghost:hover { background: #323534; color: #e1e3e1; }

.notification-list { display: flex; flex-direction: column; gap: 8px; }

.notification-card {
  display: flex; gap: 16px; padding: 16px 20px; border-radius: 12px;
  background: #F7F4EC; border: 1px solid #D6D0C2; cursor: pointer; transition: all 0.15s;
}
.dark .notification-card { background: #1d201f; border-color: #404945; }
.notification-card:hover { border-color: #B5652D; }
.notification-card.unread { border-left: 3px solid #B5652D; }

.notif-icon {
  width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}

.notif-content { flex: 1; min-width: 0; }

.notif-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 4px; }
.notif-title { font-size: 14px; font-weight: 600; color: #1e1b15; margin: 0; }
.dark .notif-title { color: #e1e3e1; }
.notif-time { font-size: 12px; color: #414846; white-space: nowrap; }
.dark .notif-time { color: #c0c8c4; }

.notif-body { font-size: 13px; color: #414846; line-height: 1.5; margin: 0; }
.dark .notif-body { color: #c0c8c4; }

.empty-state { text-align: center; padding: 60px 20px; }
.empty-icon { opacity: 0.3; margin-bottom: 12px; color: #414846; }
.dark .empty-icon { color: #c0c8c4; }
.empty-title { font-size: 18px; font-weight: 600; color: #1e1b15; margin: 0 0 6px; }
.dark .empty-title { color: #e1e3e1; }
.empty-text { font-size: 14px; color: #414846; margin: 0; }
.dark .empty-text { color: #c0c8c4; }

.skeleton {
  background: linear-gradient(90deg, #EDE8DE 25%, #D6D0C2 50%, #EDE8DE 75%);
  background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 6px;
}
.dark .skeleton { background: linear-gradient(90deg, #323534 25%, #404945 50%, #323534 75%); background-size: 200% 100%; }
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
.skeleton-card { align-items: center; }

@media (max-width: 640px) { .page { padding: 16px; } }
</style>
