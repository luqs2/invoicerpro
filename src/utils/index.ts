export function generateId() {
  return crypto.randomUUID()
}

export function formatInvoiceNumber(prefix: string, number: number, pad = 4) {
  return `${prefix}-${String(number).padStart(pad, '0')}`
}

export function calcLineItems(items: { quantity: number; unit_price: number }[]) {
  return items.reduce((sum, i) => sum + i.quantity * i.unit_price, 0)
}

export function isOverdue(dueDate: string, status: string) {
  if (status === 'paid' || status === 'cancelled') return false
  return new Date(dueDate) < new Date()
}
