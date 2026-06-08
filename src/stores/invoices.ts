import { defineStore } from 'pinia'
import { ref } from 'vue'
import { invoiceService } from '@/services/invoices'
import { useAuthStore } from './auth'
import type { Invoice, LineItem } from '@/types'

export const useInvoiceStore = defineStore('invoices', () => {
  const invoices = ref<Invoice[]>([])
  const current  = ref<Partial<Invoice>>({})
  const loading  = ref(false)

  // Computed totals from current draft
  function recalcTotals() {
    const items    = current.value.line_items ?? []
    const subtotal = items.reduce((sum, i) => sum + i.amount, 0)
    const taxRate  = current.value.tax_rate ?? 0
    const taxAmt   = subtotal * (taxRate / 100)
    const discount = current.value.discount_amount ?? 0

    current.value.subtotal   = subtotal
    current.value.tax_amount = taxAmt
    current.value.total      = subtotal + taxAmt - discount
  }

  function updateLineItem(index: number, item: Partial<LineItem>) {
    if (!current.value.line_items) return
    const updated = { ...current.value.line_items[index], ...item }
    updated.amount = updated.quantity * updated.unit_price
    current.value.line_items[index] = updated
    recalcTotals()
  }

  function addLineItem() {
    const newItem: LineItem = {
      id: crypto.randomUUID(),
      description: '',
      quantity: 1,
      unit_price: 0,
      amount: 0,
    }
    current.value.line_items = [...(current.value.line_items ?? []), newItem]
  }

  function removeLineItem(index: number) {
    current.value.line_items?.splice(index, 1)
    recalcTotals()
  }

  function resetCurrent() {
    current.value = {
      status: 'draft',
      currency: 'MYR',
      tax_rate: 6,
      discount_amount: 0,
      line_items: [],
      issue_date: new Date().toISOString().split('T')[0],
      due_date: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    }
  }

  async function fetchAll() {
    const auth = useAuthStore()
    if (!auth.user) return
    loading.value = true
    const { data } = await invoiceService.getAll(auth.user.id)
    invoices.value = data ?? []
    loading.value = false
  }

  async function save() {
    const auth = useAuthStore()
    if (!auth.user) return
    loading.value = true
    try {
      const payload = { ...current.value, user_id: auth.user.id }

      if (current.value.id) {
        const { data, error } = await invoiceService.update(current.value.id, payload)
        if (error) throw error
        const idx = invoices.value.findIndex(i => i.id === current.value.id)
        if (idx > -1 && data) invoices.value[idx] = data
      } else {
        const { data, error } = await invoiceService.create(payload)
        if (error) throw error
        if (data) invoices.value.unshift(data)
        current.value.id = data?.id
      }
    } finally {
      loading.value = false
    }
  }

  return {
    invoices, current, loading,
    fetchAll, save, resetCurrent,
    addLineItem, removeLineItem, updateLineItem, recalcTotals,
  }
})
