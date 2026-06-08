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

  async getById(id: string) {
    return supabase
      .from('receipts')
      .select('*, client:clients(*)')
      .eq('id', id)
      .single()
  },

  async create(receipt: Partial<Receipt>) {
    return supabase.from('receipts').insert(receipt).select().single()
  },

  async update(id: string, updates: Partial<Receipt>) {
    return supabase
      .from('receipts')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
  },

  async delete(id: string) {
    return supabase.from('receipts').delete().eq('id', id)
  },

  /** Generate next receipt number using business profile, falls back to random */
  async getNextNumber(userId: string, prefix = 'RCP') {
    const { data } = await supabase
      .from('business_profiles')
      .select('next_receipt_number, receipt_prefix')
      .eq('user_id', userId)
      .single()

    const p   = data?.receipt_prefix ?? prefix
    const num = data?.next_receipt_number ?? 1
    return `${p}-${String(num).padStart(4, '0')}`
  },
}
