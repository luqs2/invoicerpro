import { supabase } from './supabase'
import type { BankAccount } from '@/types'

export const bankAccountService = {
  async getAll(userId: string) {
    return supabase
      .from('bank_accounts')
      .select('id, user_id, bank_name, account_name, account_number, is_default, created_at')
      .eq('user_id', userId)
      .order('is_default', { ascending: false })
  },

  async create(account: Partial<BankAccount>) {
    return supabase.from('bank_accounts').insert(account).select().single()
  },

  async update(id: string, updates: Partial<BankAccount>) {
    return supabase.from('bank_accounts').update(updates).eq('id', id).select().single()
  },

  async delete(id: string) {
    return supabase.from('bank_accounts').delete().eq('id', id)
  },
}
