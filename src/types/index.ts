// ── Auth ──────────────────────────────────────────────
export interface User {
  id: string
  email: string
  full_name: string
  avatar_url?: string
  created_at: string
}

// ── Business Profile ──────────────────────────────────
export interface BusinessProfile {
  id: string
  user_id: string
  name: string
  email: string
  phone?: string
  address?: string
  logo_url?: string
  default_currency: string
  default_tax_rate: number
  invoice_prefix: string
  receipt_prefix: string
  next_invoice_number: number
  next_receipt_number: number
}

// ── Client ────────────────────────────────────────────
export interface Client {
  id: string
  user_id: string
  name: string
  email: string
  phone?: string
  address?: string
  company?: string
  notes?: string
  created_at: string
}

// ── Invoice ───────────────────────────────────────────
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'

export interface LineItem {
  id: string
  description: string
  quantity: number
  unit_price: number
  amount: number
}

export interface Invoice {
  id: string
  user_id: string
  client_id: string
  client?: Client
  invoice_number: string
  status: InvoiceStatus
  issue_date: string
  due_date: string
  currency: string
  line_items: LineItem[]
  subtotal: number
  tax_rate: number
  tax_amount: number
  discount_amount: number
  total: number
  notes?: string
  template_id?: string
  created_at: string
  updated_at: string
}

// ── Receipt ───────────────────────────────────────────
export type PaymentMethod = 'cash' | 'bank_transfer' | 'online' | 'card' | 'other'

export interface Receipt {
  id: string
  user_id: string
  client_id: string
  client?: Client
  invoice_id?: string
  receipt_number: string
  payment_date: string
  payment_method: PaymentMethod
  amount: number
  currency: string
  notes?: string
  template_id?: string
  created_at: string
}

// ── Template ──────────────────────────────────────────
export interface InvoiceTemplate {
  id: string
  user_id?: string          // null = system template
  name: string
  is_system: boolean
  primary_color: string
  secondary_color: string
  accent_color: string
  font_family: string
  border_radius: string
  logo_position: 'left' | 'right' | 'center'
  show_bank_details: boolean
  footer_text?: string
  created_at: string
}

// ── Dashboard Stats ───────────────────────────────────
export interface DashboardStats {
  total_revenue: number
  invoices_sent: number
  pending_amount: number
  overdue_amount: number
  recent_invoices: Invoice[]
}
