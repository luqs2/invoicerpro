import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useInvoiceStore } from '@/stores/invoices'

describe('useInvoiceStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('resetCurrent', () => {
    it('sets default values', () => {
      const store = useInvoiceStore()
      store.resetCurrent()

      expect(store.current.status).toBe('draft')
      expect(store.current.currency).toBe('MYR')
      expect(store.current.tax_rate).toBe(6)
      expect(store.current.line_items).toEqual([])
      expect(store.current.issue_date).toBeTruthy()
      expect(store.current.due_date).toBeTruthy()
    })
  })

  describe('addLineItem', () => {
    it('adds a new line item', () => {
      const store = useInvoiceStore()
      store.resetCurrent()
      store.addLineItem()

      expect(store.current.line_items).toHaveLength(1)
      expect(store.current.line_items![0].quantity).toBe(1)
      expect(store.current.line_items![0].unit_price).toBe(0)
      expect(store.current.line_items![0].amount).toBe(0)
    })

    it('adds multiple line items', () => {
      const store = useInvoiceStore()
      store.resetCurrent()
      store.addLineItem()
      store.addLineItem()
      store.addLineItem()

      expect(store.current.line_items).toHaveLength(3)
    })
  })

  describe('removeLineItem', () => {
    it('removes a line item by index', () => {
      const store = useInvoiceStore()
      store.resetCurrent()
      store.addLineItem()
      store.addLineItem()
      store.removeLineItem(0)

      expect(store.current.line_items).toHaveLength(1)
    })
  })

  describe('updateLineItem', () => {
    it('updates description', () => {
      const store = useInvoiceStore()
      store.resetCurrent()
      store.addLineItem()

      store.updateLineItem(0, { description: 'Web Design' })
      expect(store.current.line_items![0].description).toBe('Web Design')
    })

    it('recalculates amount from quantity * unit_price', () => {
      const store = useInvoiceStore()
      store.resetCurrent()
      store.addLineItem()

      store.updateLineItem(0, { quantity: 5, unit_price: 100 })
      expect(store.current.line_items![0].amount).toBe(500)
    })
  })

  describe('recalcTotals', () => {
    it('calculates subtotal from line items', () => {
      const store = useInvoiceStore()
      store.resetCurrent()
      store.addLineItem()
      store.updateLineItem(0, { quantity: 2, unit_price: 100 })
      store.addLineItem()
      store.updateLineItem(1, { quantity: 1, unit_price: 50 })

      store.recalcTotals()
      expect(store.current.subtotal).toBe(250)
    })

    it('applies tax rate', () => {
      const store = useInvoiceStore()
      store.resetCurrent()
      store.current.tax_rate = 10
      store.addLineItem()
      store.updateLineItem(0, { quantity: 1, unit_price: 100 })

      store.recalcTotals()
      expect(store.current.tax_amount).toBe(10)
      expect(store.current.total).toBe(110)
    })

    it('applies discount', () => {
      const store = useInvoiceStore()
      store.resetCurrent()
      store.current.tax_rate = 0
      store.current.discount_amount = 25
      store.addLineItem()
      store.updateLineItem(0, { quantity: 1, unit_price: 100 })

      store.recalcTotals()
      expect(store.current.total).toBe(75)
    })

    it('handles empty line items', () => {
      const store = useInvoiceStore()
      store.resetCurrent()

      store.recalcTotals()
      expect(store.current.subtotal).toBe(0)
      expect(store.current.tax_amount).toBe(0)
      expect(store.current.total).toBe(0)
    })
  })
})
