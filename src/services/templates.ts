import { supabase } from './supabase'
import type { InvoiceTemplate } from '@/types'

export const templateService = {
  async getAll(userId: string) {
    return supabase
      .from('invoice_templates')
      .select('*')
      .or(`user_id.eq.${userId},is_system.eq.true`)
      .order('is_system', { ascending: false })
  },

  async create(template: Partial<InvoiceTemplate>) {
    return supabase.from('invoice_templates').insert(template).select().single()
  },

  async update(id: string, updates: Partial<InvoiceTemplate>) {
    return supabase.from('invoice_templates').update(updates).eq('id', id).select().single()
  },

  async delete(id: string) {
    return supabase.from('invoice_templates').delete().eq('id', id)
  },
}
