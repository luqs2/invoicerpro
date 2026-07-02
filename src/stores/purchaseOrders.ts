import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/services/supabase'
import { purchaseOrderService } from '@/services/purchaseOrders'
import { useAuthStore } from './auth'
import type { PurchaseOrder, LineItem } from '@/types'

export const usePurchaseOrderStore = defineStore('purchaseOrders', () => {
  const purchaseOrders = ref<PurchaseOrder[]>([])
  const current        = ref<Partial<PurchaseOrder>>({})
  const loading        = ref(false)
  let channel: ReturnType<typeof supabase.channel> | null = null

  function recalcTotals() {
    const items    = current.value.line_items ?? []
    const subtotal = items.reduce((sum, i) => sum + i.amount, 0)
    const taxRate  = current.value.tax_rate ?? 0
    const taxAmt   = subtotal * (taxRate / 100)

    current.value.subtotal   = subtotal
    current.value.tax_amount = taxAmt
    current.value.total      = subtotal + taxAmt
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
      client_name: '',
      client_email: '',
      client_phone: '',
      client_address: '',
      currency: 'MYR',
      tax_rate: 0,
      line_items: [],
      order_date: new Date().toISOString().split('T')[0],
    }
  }

  async function fetchAll() {
    const auth = useAuthStore()
    if (!auth.user) return
    loading.value = true
    const { data } = await purchaseOrderService.getAll(auth.user.id)
    purchaseOrders.value = data ?? []
    loading.value = false
  }

  async function save() {
    const auth = useAuthStore()
    if (!auth.user) return
    loading.value = true
    try {
      const { client: _client, ...payload } = { ...current.value, user_id: auth.user.id }

      if (current.value.id) {
        const { data, error } = await purchaseOrderService.update(current.value.id, payload)
        if (error) throw error
        const idx = purchaseOrders.value.findIndex(p => p.id === current.value.id)
        if (idx > -1 && data) purchaseOrders.value[idx] = data
      } else {
        const { data, error } = await purchaseOrderService.create(payload)
        if (error) throw error
        if (data) {
          purchaseOrders.value.unshift(data)
          current.value = { ...current.value, ...data }
        }
      }
    } finally {
      loading.value = false
    }
  }

  async function updateStatus(id: string, status: PurchaseOrder['status']) {
    const idx = purchaseOrders.value.findIndex(p => p.id === id)
    const prev = idx > -1 ? purchaseOrders.value[idx].status : null

    if (idx > -1) {
      purchaseOrders.value[idx] = { ...purchaseOrders.value[idx], status }
    }

    const { error } = await purchaseOrderService.updateStatus(id, status)
    if (error && prev) {
      purchaseOrders.value[idx] = { ...purchaseOrders.value[idx], status: prev }
      throw error
    }
  }

  function subscribe() {
    if (channel) return
    const auth = useAuthStore()
    if (!auth.user) return

    channel = supabase
      .channel('purchase-orders-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'purchase_orders', filter: `user_id=eq.${auth.user.id}` },
        async (payload) => {
          const { data } = await purchaseOrderService.getById(payload.new.id)
          if (data) purchaseOrders.value.unshift(data)
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'purchase_orders', filter: `user_id=eq.${auth.user.id}` },
        (payload) => {
          const idx = purchaseOrders.value.findIndex(p => p.id === payload.new.id)
          if (idx > -1) purchaseOrders.value[idx] = { ...purchaseOrders.value[idx], ...payload.new }
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'purchase_orders', filter: `user_id=eq.${auth.user.id}` },
        (payload) => {
          purchaseOrders.value = purchaseOrders.value.filter(p => p.id !== payload.old.id)
        }
      )
      .subscribe()
  }

  function unsubscribe() {
    if (channel) {
      supabase.removeChannel(channel)
      channel = null
    }
  }

  return {
    purchaseOrders, current, loading,
    fetchAll, save, updateStatus, resetCurrent, subscribe, unsubscribe,
    addLineItem, removeLineItem, updateLineItem, recalcTotals,
  }
})
