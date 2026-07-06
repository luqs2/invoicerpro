interface WhatsAppMessage {
  clientName: string
  documentType: 'invoice' | 'receipt' | 'purchase_order'
  documentNumber: string
  amount: string
  currency: string
  dueDate?: string
  paymentDate?: string
  businessName?: string
  invoiceLink?: string
}

function getDocLabel(type: string): string {
  if (type === 'invoice') return 'invoice'
  if (type === 'receipt') return 'receipt'
  return 'purchase order'
}

function buildMessage(msg: WhatsAppMessage): string {
  const docLabel = getDocLabel(msg.documentType)
  let body = `Hi ${msg.clientName},\n\nHere is your ${docLabel} *${msg.documentNumber}* for *${msg.amount}*.`

  if (msg.invoiceLink) {
    body += `\n\nView it here: ${msg.invoiceLink}`
  }

  if (msg.dueDate) body += `\nDue date: ${msg.dueDate}`
  if (msg.paymentDate) body += `\nPayment date: ${msg.paymentDate}`

  if (!msg.invoiceLink) {
    body += `\n\nPlease find the PDF attached separately.`
  }

  if (msg.businessName) body += `\n\n— ${msg.businessName}`

  return body
}

export function buildWhatsAppUrl(phone: string, msg: WhatsAppMessage): string | null {
  if (!phone) return null

  const digits = phone.replace(/[\s\-()]/g, '')
  if (!digits || digits.length < 7) return null

  const phoneDigits = digits.startsWith('+') ? digits.slice(1) : digits
  const body = buildMessage(msg)
  const encoded = encodeURIComponent(body)

  return `https://wa.me/${phoneDigits}?text=${encoded}`
}
