import { supabase } from './supabase'
import type { Invoice, InvoiceStatus } from '@/types'

export const invoiceService = {
  async getAll(userId: string) {
    return supabase
      .from('invoices')
      .select('*, client:clients(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
  },

  async getById(id: string) {
    return supabase
      .from('invoices')
      .select('*, client:clients(*)')
      .eq('id', id)
      .single()
  },

  async getByClientId(clientId: string) {
    return supabase
      .from('invoices')
      .select('*, client:clients(*)')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
  },

  async create(invoice: Partial<Invoice>) {
    return supabase.from('invoices').insert(invoice).select().single()
  },

  async update(id: string, updates: Partial<Invoice>) {
    return supabase
      .from('invoices')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
  },

  async updateStatus(id: string, status: InvoiceStatus) {
    return supabase
      .from('invoices')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
  },

  async delete(id: string) {
    return supabase.from('invoices').delete().eq('id', id)
  },

  async getNextNumber(userId: string, prefix = 'INV') {
    const { data } = await supabase
      .from('business_profiles')
      .select('next_invoice_number, invoice_prefix')
      .eq('user_id', userId)
      .single()

    const p   = data?.invoice_prefix ?? prefix
    const num = data?.next_invoice_number ?? 1
    return `${p}-${String(num).padStart(4, '0')}`
  },

  async getPublicSlug(invoiceId: string) {
    const { data } = await supabase
      .from('invoices')
      .select('public_slug')
      .eq('id', invoiceId)
      .single()

    // If slug exists, return it
    if (data?.public_slug) return data.public_slug

    // Generate one for existing invoices that don't have a slug yet
    const slug = Math.random().toString(36).substring(2, 10)
    await supabase
      .from('invoices')
      .update({ public_slug: slug })
      .eq('id', invoiceId)

    return slug
  },

  async getPublicBySlug(slug: string) {
    const { data, error } = await supabase
      .from('invoices')
      .select('*, client:clients(name, email, phone, address, company)')
      .eq('public_slug', slug)
      .single()
    if (error || !data) return null
    return data
  },
}
