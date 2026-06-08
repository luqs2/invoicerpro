import { supabase } from './supabase'
import type { Client } from '@/types'

export const clientService = {
  async getAll(userId: string) {
    return supabase
      .from('clients')
      .select('*')
      .eq('user_id', userId)
      .order('name')
  },

  async getById(id: string) {
    return supabase.from('clients').select('*').eq('id', id).single()
  },

  async create(client: Partial<Client>) {
    return supabase.from('clients').insert(client).select().single()
  },

  async update(id: string, updates: Partial<Client>) {
    return supabase.from('clients').update(updates).eq('id', id).select().single()
  },

  async delete(id: string) {
    return supabase.from('clients').delete().eq('id', id)
  },
}
