import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/services/supabase'
import { clientService } from '@/services/clients'
import { useAuthStore } from './auth'
import type { Client } from '@/types'

export const useClientStore = defineStore('clients', () => {
  const clients = ref<Client[]>([])
  const loading = ref(false)
  let channel: ReturnType<typeof supabase.channel> | null = null

  async function fetchAll() {
    const auth = useAuthStore()
    if (!auth.user) return
    loading.value = true
    const { data } = await clientService.getAll(auth.user.id)
    clients.value = data ?? []
    loading.value = false
  }

  function subscribe() {
    if (channel) return
    const auth = useAuthStore()
    if (!auth.user) return

    channel = supabase
      .channel('clients-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'clients', filter: `user_id=eq.${auth.user.id}` },
        (payload) => {
          clients.value.unshift(payload.new as Client)
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'clients', filter: `user_id=eq.${auth.user.id}` },
        (payload) => {
          const idx = clients.value.findIndex(c => c.id === payload.new.id)
          if (idx > -1) clients.value[idx] = { ...clients.value[idx], ...payload.new }
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'clients', filter: `user_id=eq.${auth.user.id}` },
        (payload) => {
          clients.value = clients.value.filter(c => c.id !== payload.old.id)
        }
      )
      .subscribe()
  }

  function unsubscribe() {
    if (channel) {
      supabase.removeChannel(channel)
      channel = null
    }
  }

  async function create(client: Partial<Client>) {
    const auth = useAuthStore()
    if (!auth.user) return
    const { data } = await clientService.create({ ...client, user_id: auth.user.id })
    if (data) clients.value.push(data)
    return data
  }

  async function update(id: string, updates: Partial<Client>) {
    const { data } = await clientService.update(id, updates)
    if (data) {
      const idx = clients.value.findIndex(c => c.id === id)
      if (idx > -1) clients.value[idx] = data
    }
    return data
  }

  async function remove(id: string) {
    await clientService.delete(id)
    clients.value = clients.value.filter(c => c.id !== id)
  }

  return { clients, loading, fetchAll, create, update, remove, subscribe, unsubscribe }
})
