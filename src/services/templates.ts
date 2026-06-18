import { supabase } from './supabase'
import type { InvoiceTemplate } from '@/types'

export const templateService = {
  async getAll(userId: string) {
    if (!userId || typeof userId !== 'string') throw new Error('Invalid user ID')
    return supabase
      .from('invoice_templates')
      .select('id, user_id, name, is_system, primary_color, secondary_color, accent_color, header_text_color, body_text_color, font_family, border_radius, header_layout, company_font_size, logo_position, show_bank_details, footer_text, created_at')
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
