interface WhatsAppMessage {
  clientName: string
  documentType: 'invoice' | 'receipt' | 'purchase_order'
  documentNumber: string
  amount: string
  currency: string
  dueDate?: string
  paymentDate?: string
  businessName?: string
}

function getDocLabel(type: string): string {
  if (type === 'invoice') return 'invoice'
  if (type === 'receipt') return 'receipt'
  return 'purchase order'
}

export function buildWhatsAppUrl(phone: string, msg: WhatsAppMessage): string | null {
  if (!phone) return null

  // Normalize: strip spaces, dashes, parentheses, keep leading +
  const digits = phone.replace(/[\s\-()]/g, '')
  if (!digits || digits.length < 7) return null

  // Remove leading + for the URL (wa.me and web.whatsapp.com expect digits only)
  const phoneDigits = digits.startsWith('+') ? digits.slice(1) : digits

  const docLabel = getDocLabel(msg.documentType)
  let body = `Hi ${msg.clientName},\n\nHere is your ${docLabel} *${msg.documentNumber}* for *${msg.amount}*.`

  if (msg.dueDate) body += `\nDue date: ${msg.dueDate}`
  if (msg.paymentDate) body += `\nPayment date: ${msg.paymentDate}`

  body += `\n\nPlease find the PDF attached separately.`
  if (msg.businessName) body += `\n\n— ${msg.businessName}`

  const encoded = encodeURIComponent(body)
  return `https://web.whatsapp.com/send?phone=${phoneDigits}&text=${encoded}`
}

export function isMobile(): boolean {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
}

export function buildWhatsAppDeepLink(phone: string, msg: WhatsAppMessage): string | null {
  if (!phone) return null

  const digits = phone.replace(/[\s\-()]/g, '')
  if (!digits || digits.length < 7) return null

  const phoneDigits = digits.startsWith('+') ? digits.slice(1) : digits

  const docLabel = getDocLabel(msg.documentType)
  let body = `Hi ${msg.clientName},\n\nHere is your ${docLabel} *${msg.documentNumber}* for *${msg.amount}*.`

  if (msg.dueDate) body += `\nDue date: ${msg.dueDate}`
  if (msg.paymentDate) body += `\nPayment date: ${msg.paymentDate}`

  body += `\n\nPlease find the PDF attached separately.`
  if (msg.businessName) body += `\n\n— ${msg.businessName}`

  const encoded = encodeURIComponent(body)
  return `https://wa.me/${phoneDigits}?text=${encoded}`
}
