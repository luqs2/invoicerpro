import { defineStore } from 'pinia'
import { ref } from 'vue'
import { bankAccountService } from '@/services/bankAccounts'
import { useAuthStore } from './auth'
import type { BankAccount } from '@/types'

export const useBankAccountStore = defineStore('bankAccounts', () => {
  const accounts = ref<BankAccount[]>([])
  const loading = ref(false)

  async function fetchAll() {
    const auth = useAuthStore()
    if (!auth.user) return
    loading.value = true
    const { data } = await bankAccountService.getAll(auth.user.id)
    accounts.value = data ?? []
    loading.value = false
  }

  async function create(account: Partial<BankAccount>) {
    const auth = useAuthStore()
    if (!auth.user) return
    const { data, error } = await bankAccountService.create({ ...account, user_id: auth.user.id })
    if (error) throw error
    if (data) accounts.value.push(data)
    return data
  }

  async function update(id: string, updates: Partial<BankAccount>) {
    const { data, error } = await bankAccountService.update(id, updates)
    if (error) throw error
    if (data) {
      const idx = accounts.value.findIndex(a => a.id === id)
      if (idx > -1) accounts.value[idx] = data
    }
    return data
  }

  async function remove(id: string) {
    await bankAccountService.delete(id)
    accounts.value = accounts.value.filter(a => a.id !== id)
  }

  async function setDefault(id: string) {
    const auth = useAuthStore()
    if (!auth.user) return
    // Reset all to non-default, then set the target
    for (const a of accounts.value) {
      if (a.is_default && a.id !== id) {
        await update(a.id, { is_default: false })
      }
    }
    await update(id, { is_default: true })
  }

  return { accounts, loading, fetchAll, create, update, remove, setDefault }
})
