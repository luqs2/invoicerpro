import { defineStore } from 'pinia'
import { ref } from 'vue'
import { clientService } from '@/services/clients'
import { useAuthStore } from './auth'
import type { Client } from '@/types'

export const useClientStore = defineStore('clients', () => {
  const clients = ref<Client[]>([])
  const loading = ref(false)

  async function fetchAll() {
    const auth = useAuthStore()
    if (!auth.user) return
    loading.value = true
    const { data } = await clientService.getAll(auth.user.id)
    clients.value = data ?? []
    loading.value = false
  }

  async function create(client: Partial<Client>) {
    const auth = useAuthStore()
    if (!auth.user) return
    const { data } = await clientService.create({ ...client, user_id: auth.user.id })
    if (data) clients.value.push(data)
    return data
  }

  async function remove(id: string) {
    await clientService.delete(id)
    clients.value = clients.value.filter(c => c.id !== id)
  }

  return { clients, loading, fetchAll, create, remove }
})
