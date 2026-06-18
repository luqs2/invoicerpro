import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/services/supabase'
import { useAuthStore } from './auth'
import type { BusinessProfile } from '@/types'

export const useBusinessProfileStore = defineStore('businessProfile', () => {
  const profile = ref<Partial<BusinessProfile>>({})
  const loading = ref(false)

  async function fetch() {
    const auth = useAuthStore()
    if (!auth.user) return
    loading.value = true
    const { data } = await supabase
      .from('business_profiles')
      .select('id, user_id, name, email, phone, address, logo_url, default_currency, default_tax_rate, invoice_prefix, receipt_prefix, next_invoice_number, next_receipt_number, active_template_id')
      .eq('user_id', auth.user.id)
      .single()
    if (data) profile.value = data
    loading.value = false
  }

  async function save(updates: Partial<BusinessProfile>) {
    const auth = useAuthStore()
    if (!auth.user) return

    const { data, error } = await supabase
      .from('business_profiles')
      .upsert({ ...updates, user_id: auth.user.id }, { onConflict: 'user_id' })
      .select()
      .single()

    if (error) throw error
    if (data) profile.value = data
    return data
  }

  async function uploadLogo(file: File): Promise<string> {
    const auth = useAuthStore()
    if (!auth.user) throw new Error('Not authenticated')

    const ext  = file.name.split('.').pop()
    const path = `${auth.user.id}/logo.${ext}`

    // Try upload first; if the file already exists, fall back to update (PUT)
    let uploadError: any = null

    const { error: err1 } = await supabase.storage
      .from('logos')
      .upload(path, file, { contentType: file.type })

    uploadError = err1

    if (uploadError) {
      // "The resource already exists" — use update instead
      if (uploadError.statusCode === '23505' || uploadError.message?.toLowerCase().includes('already exists') || uploadError.statusCode === '400') {
        const { error: err2 } = await supabase.storage
          .from('logos')
          .update(path, file, { contentType: file.type })
        if (err2) throw err2
      } else {
        throw uploadError
      }
    }

    const { data } = supabase.storage.from('logos').getPublicUrl(path)
    // Bust the cache so the browser doesn't show the old logo
    return `${data.publicUrl}?t=${Date.now()}`
  }

  return { profile, loading, fetch, save, uploadLogo }
})
