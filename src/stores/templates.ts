import { defineStore } from 'pinia'
import { ref } from 'vue'
import { templateService } from '@/services/templates'
import { useAuthStore } from './auth'
import type { InvoiceTemplate } from '@/types'

export const useTemplateStore = defineStore('templates', () => {
  const templates = ref<InvoiceTemplate[]>([])
  const active    = ref<InvoiceTemplate | null>(null)

  async function fetchAll() {
    const auth = useAuthStore()
    if (!auth.user) return
    const { data } = await templateService.getAll(auth.user.id)
    templates.value = data ?? []
    if (!active.value && data?.length) {
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

  function setActive(template: InvoiceTemplate) {
    active.value = template
  }

  return { templates, active, fetchAll, save, setActive }
})
