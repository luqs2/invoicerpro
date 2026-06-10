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

    // Restore the previously saved active template from business profile
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
    if (!auth.user) return
    if (template.id) {
      const { data } = await templateService.update(template.id, template)
      const idx = templates.value.findIndex(t => t.id === template.id)
      if (idx > -1 && data) templates.value[idx] = data
      return data
    } else {
      const { data } = await templateService.create({ ...template, user_id: auth.user.id, is_system: false })
      if (data) templates.value.push(data)
      return data
    }
  }

  async function setActive(template: InvoiceTemplate) {
    active.value = template

    // Persist the choice to business_profiles so it survives a refresh
    const bpStore = useBusinessProfileStore()
    await bpStore.save({ active_template_id: template.id } as any)
  }

  return { templates, active, fetchAll, save, setActive }
})