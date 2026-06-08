import { supabase } from './supabase'
import type { Receipt } from '@/types'

export const receiptService = {
  async getAll(userId: string) {
    return supabase
      .from('receipts')
      .select('*, client:clients(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
  },

  async create(receipt: Partial<Receipt>) {
    return supabase.from('receipts').insert(receipt).select().single()
  },

  async delete(id: string) {
    return supabase.from('receipts').delete().eq('id', id)
  },
}
