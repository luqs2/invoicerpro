import { defineStore } from 'pinia'
import { ref } from 'vue'
import { templateService } from '@/services/templates'
import { useAuthStore } from './auth'
import { useBusinessProfileStore } from './businessProfile'
import type { InvoiceTemplate } from '@/types'

export const useTemplateStore = defineStore('templates', () => {
  const templates = ref<InvoiceTemplate[]>([])
  const active    = ref<InvoiceTemplate | null>(null)

  async function fetchAll() {
    const auth = useAuthStore()
    if (!auth.user) return

    const { data } = await templateService.getAll(auth.user.id)
    templates.value = data ?? []

    if (!data?.length) return

    const bpStore = useBusinessProfileStore()
    await bpStore.fetch()
    const savedId = (bpStore.profile as any).active_template_id as string | undefined

    if (savedId) {
      const match = data.find(t => t.id === savedId)
      active.value = match ?? data[0]
    } else {
      active.value = data[0]
    }
  }

  async function save(template: Partial<InvoiceTemplate>) {
    const auth = useAuthStore()
    if (!auth.user) throw new Error('Not authenticated')

    const isSystem = template.is_system || !template.user_id
    const payload = isSystem
      ? { ...template, id: undefined, is_system: false, user_id: auth.user.id }
      : template

    if (payload.id) {
      const { data, error } = await templateService.update(payload.id, payload)
      if (error) throw error
      const idx = templates.value.findIndex(t => t.id === payload.id)
      if (idx > -1 && data) {
        templates.value[idx] = data
        active.value = data
      }
      return data
    } else {
      const { data, error } = await templateService.create({ ...payload, user_id: auth.user.id, is_system: false })
      if (error) throw error
      if (data) {
        templates.value.push(data)
        active.value = data
        await setActive(data)
      }
      return data
    }
  }

  async function setActive(template: InvoiceTemplate) {
    active.value = template

    const bpStore = useBusinessProfileStore()
    await bpStore.save({ active_template_id: template.id } as any)
  }

  return { templates, active, fetchAll, save, setActive }
})