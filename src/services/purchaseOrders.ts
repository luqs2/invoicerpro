import { supabase } from './supabase'
import type { PurchaseOrder, PurchaseOrderStatus } from '@/types'

export const purchaseOrderService = {
  async getAll(userId: string) {
    return supabase
      .from('purchase_orders')
      .select('*, client:clients(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
  },

  async getById(id: string) {
    return supabase
      .from('purchase_orders')
      .select('*, client:clients(*)')
      .eq('id', id)
      .single()
  },

  async create(po: Partial<PurchaseOrder>) {
    return supabase.from('purchase_orders').insert(po).select().single()
  },

  async update(id: string, updates: Partial<PurchaseOrder>) {
    return supabase
      .from('purchase_orders')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
  },

  async updateStatus(id: string, status: PurchaseOrderStatus) {
    return supabase
      .from('purchase_orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
  },

  async delete(id: string) {
    return supabase.from('purchase_orders').delete().eq('id', id)
  },
}
