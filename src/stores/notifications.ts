import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/services/supabase'
import type { Notification } from '@/types'

export const useNotificationStore = defineStore('notifications', () => {
  const notifications = ref<Notification[]>([])
  const loading = ref(false)

  const unreadCount = computed(() => {
    return notifications.value.filter(n => {
      const readBy = Array.isArray(n.is_read_by) ? n.is_read_by : []
      return readBy.length === 0
    }).length
  })

  async function fetchNotifications() {
    loading.value = true
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { loading.value = false; return }

    const { data } = await supabase
      .from('notifications')
      .select('*')
      .or(`target_users.eq.all,created_by.eq.${user.id}`)
      .order('created_at', { ascending: false })
      .limit(50)

    notifications.value = data ?? []
    loading.value = false
  }

  async function markAsRead(notificationId: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const notification = notifications.value.find(n => n.id === notificationId)
    if (!notification) return

    const readBy = Array.isArray(notification.is_read_by) ? [...notification.is_read_by] : []
    if (!readBy.includes(user.id)) {
      readBy.push(user.id)
    }

    const { error } = await supabase
      .from('notifications')
      .update({ is_read_by: readBy })
      .eq('id', notificationId)

    if (!error) {
      notification.is_read_by = readBy
    }
  }

  async function markAllAsRead() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    for (const n of notifications.value) {
      const readBy = Array.isArray(n.is_read_by) ? [...n.is_read_by] : []
      if (!readBy.includes(user.id)) {
        readBy.push(user.id)
        await supabase
          .from('notifications')
          .update({ is_read_by: readBy })
          .eq('id', n.id)
        n.is_read_by = readBy
      }
    }
  }

  return { notifications, loading, unreadCount, fetchNotifications, markAsRead, markAllAsRead }
})
