import { supabase, supabaseAdmin } from '@/services/supabase'
import type {
  UserWithStats, AdminGlobalStats, Notification, News,
  AdminDocumentStats, MonthlyData,
} from '@/types'

// Use service-role client for admin queries (bypasses RLS)
// Falls back to regular client if service role key is not configured
function adminClient() {
  return supabaseAdmin ?? supabase
}

// ── Global Stats ─────────────────────────────────────────────────────────────

export async function getGlobalStats(): Promise<AdminGlobalStats> {
  const client = adminClient()

  const [usersRes, invoicesRes, receiptsRes, poRes] = await Promise.all([
    client.from('profiles').select('id', { count: 'exact', head: true }),
    client.from('invoices').select('id, total, created_at', { count: 'exact' }),
    client.from('receipts').select('id, amount', { count: 'exact' }),
    client.from('purchase_orders').select('id, total', { count: 'exact' }),
  ])

  const totalUsers = usersRes.count ?? 0
  const invoices = invoicesRes.data ?? []

  const totalInvoices = invoicesRes.count ?? 0
  const totalReceipts = receiptsRes.count ?? 0
  const totalPOs = poRes.count ?? 0
  const totalRevenue = invoices.reduce((sum, inv) => sum + (Number(inv.total) || 0), 0)

  // Calculate trends (compare this month vs last month)
  const now = new Date()
  const thisMonth = now.toISOString().slice(0, 7)
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().slice(0, 7)

  const thisMonthInvoices = invoices.filter(i => i.created_at?.startsWith(thisMonth))
  const lastMonthInvoices = invoices.filter(i => i.created_at?.startsWith(lastMonth))

  const usersTrend = totalUsers > 0 ? Math.round((totalUsers / Math.max(totalUsers, 1)) * 100) : 0
  const invoicesTrend = lastMonthInvoices.length > 0
    ? Math.round(((thisMonthInvoices.length - lastMonthInvoices.length) / lastMonthInvoices.length) * 100)
    : thisMonthInvoices.length > 0 ? 100 : 0

  const thisMonthRevenue = thisMonthInvoices.reduce((s, i) => s + (Number(i.total) || 0), 0)
  const lastMonthRevenue = lastMonthInvoices.reduce((s, i) => s + (Number(i.total) || 0), 0)
  const revenueTrend = lastMonthRevenue > 0
    ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
    : thisMonthRevenue > 0 ? 100 : 0

  return {
    total_users: totalUsers,
    total_invoices: totalInvoices,
    total_receipts: totalReceipts,
    total_purchase_orders: totalPOs,
    total_revenue: totalRevenue,
    users_trend: usersTrend,
    invoices_trend: invoicesTrend,
    revenue_trend: revenueTrend,
    receipts_trend: 0,
  }
}

// ── User Growth ──────────────────────────────────────────────────────────────

export async function getUserGrowth(): Promise<MonthlyData[]> {
  const client = adminClient()
  const { data: profiles } = await client
    .from('profiles')
    .select('created_at')

  if (!profiles) return []

  const monthly: Record<string, number> = {}
  const now = new Date()

  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = d.toISOString().slice(0, 7)
    monthly[key] = 0
  }

  profiles.forEach(p => {
    const key = p.created_at?.slice(0, 7)
    if (key && key in monthly) monthly[key]++
  })

  return Object.entries(monthly).map(([month, count]) => ({ month, count }))
}

// ── Users ────────────────────────────────────────────────────────────────────

export async function getAllUsers(params: {
  page?: number
  limit?: number
  search?: string
} = {}): Promise<{ data: UserWithStats[]; total: number }> {
  const { page = 1, limit = 20, search = '' } = params
  const client = adminClient()

  let query = client
    .from('profiles')
    .select('id, full_name, avatar_url, role, created_at', { count: 'exact' })

  if (search) {
    query = query.or(`full_name.ilike.%${search}%,id.eq.${search}`)
  }

  const from = (page - 1) * limit
  const { data: profiles, count } = await query
    .order('created_at', { ascending: false })
    .range(from, from + limit - 1)

  if (!profiles || profiles.length === 0) {
    return { data: [], total: count ?? 0 }
  }

  const userIds = profiles.map((p: any) => p.id)

  // Fetch related data separately (all FKs reference auth.users, not profiles)
  const [bpRes, invRes, recRes, poRes] = await Promise.all([
    client.from('business_profiles').select('user_id, name').in('user_id', userIds),
    client.from('invoices').select('user_id, total').in('user_id', userIds),
    client.from('receipts').select('user_id, amount').in('user_id', userIds),
    client.from('purchase_orders').select('user_id, total').in('user_id', userIds),
  ])

  // Build lookup maps
  const bpByUser: Record<string, string> = {}
  ;(bpRes.data ?? []).forEach((bp: any) => { bpByUser[bp.user_id] = bp.name })

  const invByUser: Record<string, { count: number; revenue: number }> = {}
  ;(invRes.data ?? []).forEach((i: any) => {
    if (!invByUser[i.user_id]) invByUser[i.user_id] = { count: 0, revenue: 0 }
    invByUser[i.user_id].count++
    invByUser[i.user_id].revenue += Number(i.total) || 0
  })
  const recByUser: Record<string, number> = {}
  ;(recRes.data ?? []).forEach((r: any) => {
    recByUser[r.user_id] = (recByUser[r.user_id] || 0) + 1
  })
  const poByUser: Record<string, number> = {}
  ;(poRes.data ?? []).forEach((p: any) => {
    poByUser[p.user_id] = (poByUser[p.user_id] || 0) + 1
  })

  const users: UserWithStats[] = profiles.map((u: any) => ({
    id: u.id,
    full_name: u.full_name,
    avatar_url: u.avatar_url,
    role: u.role,
    created_at: u.created_at,
    business_name: bpByUser[u.id],
    invoice_count: invByUser[u.id]?.count ?? 0,
    receipt_count: recByUser[u.id] ?? 0,
    po_count: poByUser[u.id] ?? 0,
    total_revenue: invByUser[u.id]?.revenue ?? 0,
  }))

  return { data: users, total: count ?? 0 }
}

export async function getUserDetail(userId: string) {
  const client = adminClient()

  const { data: profile } = await client
    .from('profiles')
    .select('id, full_name, avatar_url, role, created_at')
    .eq('id', userId)
    .single()

  if (!profile) return null

  const { data: bp } = await client
    .from('business_profiles')
    .select('name, email, phone, address, default_currency')
    .eq('user_id', userId)
    .single()

  const [invoicesRes, receiptsRes, poRes, clientsRes] = await Promise.all([
    client.from('invoices').select('id, invoice_number, status, total, created_at, client_id')
      .eq('user_id', userId).order('created_at', { ascending: false }).limit(50),
    client.from('receipts').select('id, receipt_number, amount, payment_method, payment_date, created_at, client_id')
      .eq('user_id', userId).order('created_at', { ascending: false }).limit(50),
    client.from('purchase_orders').select('id, po_number, status, total, created_at, client_id')
      .eq('user_id', userId).order('created_at', { ascending: false }).limit(50),
    client.from('clients').select('id, name').eq('user_id', userId),
  ])

  // Build client lookup
  const clientMap: Record<string, string> = {}
  ;(clientsRes.data ?? []).forEach((c: any) => { clientMap[c.id] = c.name })

  const enrichDocs = (docs: any[]) => docs.map(d => ({ ...d, client: clientMap[d.client_id] ? { name: clientMap[d.client_id] } : null }))

  return {
    ...profile,
    business: bp,
    invoices: enrichDocs(invoicesRes.data ?? []),
    receipts: enrichDocs(receiptsRes.data ?? []),
    purchase_orders: enrichDocs(poRes.data ?? []),
    stats: {
      invoice_count: invoicesRes.data?.length ?? 0,
      receipt_count: receiptsRes.data?.length ?? 0,
      po_count: poRes.data?.length ?? 0,
      total_revenue: (invoicesRes.data ?? []).reduce((s: number, i: any) => s + (Number(i.total) || 0), 0),
    },
  }
}

export async function updateUserRole(userId: string, role: string) {
  const client = adminClient()
  const { error } = await client
    .from('profiles')
    .update({ role })
    .eq('id', userId)
  if (error) throw error
}

// ── Document Stats ───────────────────────────────────────────────────────────

export async function getInvoiceStats(): Promise<AdminDocumentStats> {
  const client = adminClient()
  const { data } = await client.from('invoices').select('id, total, status, created_at')

  if (!data) return { total_count: 0, total_value: 0, avg_value: 0, monthly_trend: [], status_breakdown: [] }

  const totalCount = data.length
  const totalValue = data.reduce((s, i) => s + (Number(i.total) || 0), 0)
  const avgValue = totalCount > 0 ? totalValue / totalCount : 0

  // Monthly trend
  const monthly: Record<string, { count: number; revenue: number }> = {}
  const now = new Date()
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    monthly[d.toISOString().slice(0, 7)] = { count: 0, revenue: 0 }
  }
  data.forEach(inv => {
    const key = inv.created_at?.slice(0, 7)
    if (key && key in monthly) {
      monthly[key].count++
      monthly[key].revenue += Number(inv.total) || 0
    }
  })
  const monthlyTrend = Object.entries(monthly).map(([month, v]) => ({ month, count: v.count, revenue: v.revenue }))

  // Status breakdown
  const statusMap: Record<string, { count: number; total: number }> = {}
  data.forEach(inv => {
    const s = inv.status || 'unknown'
    if (!statusMap[s]) statusMap[s] = { count: 0, total: 0 }
    statusMap[s].count++
    statusMap[s].total += Number(inv.total) || 0
  })
  const statusBreakdown = Object.entries(statusMap).map(([status, v]) => ({ status, ...v }))

  return { total_count: totalCount, total_value: totalValue, avg_value: avgValue, monthly_trend: monthlyTrend, status_breakdown: statusBreakdown }
}

export async function getReceiptStats(): Promise<AdminDocumentStats> {
  const client = adminClient()
  const { data } = await client.from('receipts').select('id, amount, payment_method, created_at')

  if (!data) return { total_count: 0, total_value: 0, avg_value: 0, monthly_trend: [], status_breakdown: [] }

  const totalCount = data.length
  const totalValue = data.reduce((s, r) => s + (Number(r.amount) || 0), 0)
  const avgValue = totalCount > 0 ? totalValue / totalCount : 0

  const monthly: Record<string, { count: number; revenue: number }> = {}
  const now = new Date()
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    monthly[d.toISOString().slice(0, 7)] = { count: 0, revenue: 0 }
  }
  data.forEach(r => {
    const key = r.created_at?.slice(0, 7)
    if (key && key in monthly) {
      monthly[key].count++
      monthly[key].revenue += Number(r.amount) || 0
    }
  })
  const monthlyTrend = Object.entries(monthly).map(([month, v]) => ({ month, count: v.count, revenue: v.revenue }))

  const methodMap: Record<string, { count: number; total: number }> = {}
  data.forEach(r => {
    const m = r.payment_method || 'unknown'
    if (!methodMap[m]) methodMap[m] = { count: 0, total: 0 }
    methodMap[m].count++
    methodMap[m].total += Number(r.amount) || 0
  })
  const statusBreakdown = Object.entries(methodMap).map(([status, v]) => ({ status, ...v }))

  return { total_count: totalCount, total_value: totalValue, avg_value: avgValue, monthly_trend: monthlyTrend, status_breakdown: statusBreakdown }
}

export async function getPOStats(): Promise<AdminDocumentStats> {
  const client = adminClient()
  const { data } = await client.from('purchase_orders').select('id, total, status, created_at')

  if (!data) return { total_count: 0, total_value: 0, avg_value: 0, monthly_trend: [], status_breakdown: [] }

  const totalCount = data.length
  const totalValue = data.reduce((s, p) => s + (Number(p.total) || 0), 0)
  const avgValue = totalCount > 0 ? totalValue / totalCount : 0

  const monthly: Record<string, { count: number; revenue: number }> = {}
  const now = new Date()
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    monthly[d.toISOString().slice(0, 7)] = { count: 0, revenue: 0 }
  }
  data.forEach(po => {
    const key = po.created_at?.slice(0, 7)
    if (key && key in monthly) {
      monthly[key].count++
      monthly[key].revenue += Number(po.total) || 0
    }
  })
  const monthlyTrend = Object.entries(monthly).map(([month, v]) => ({ month, count: v.count, revenue: v.revenue }))

  const statusMap: Record<string, { count: number; total: number }> = {}
  data.forEach(po => {
    const s = po.status || 'unknown'
    if (!statusMap[s]) statusMap[s] = { count: 0, total: 0 }
    statusMap[s].count++
    statusMap[s].total += Number(po.total) || 0
  })
  const statusBreakdown = Object.entries(statusMap).map(([status, v]) => ({ status, ...v }))

  return { total_count: totalCount, total_value: totalValue, avg_value: avgValue, monthly_trend: monthlyTrend, status_breakdown: statusBreakdown }
}

// ── Notifications ────────────────────────────────────────────────────────────

export async function createNotification(data: {
  title: string
  body: string
  type?: string
  target_users?: string
  send_email?: boolean
}): Promise<Notification> {
  const { data: notification, error } = await adminClient()
    .from('notifications')
    .insert({
      title: data.title,
      body: data.body,
      type: data.type ?? 'info',
      target_users: data.target_users ?? 'all',
      send_email: data.send_email ?? false,
      created_by: (await supabase.auth.getUser()).data.user?.id,
    })
    .select()
    .single()

  if (error) throw error
  return notification
}

export async function getNotifications(params: {
  page?: number
  limit?: number
} = {}): Promise<{ data: Notification[]; total: number }> {
  const { page = 1, limit = 20 } = params
  const from = (page - 1) * limit

  const { data, count } = await adminClient()
    .from('notifications')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, from + limit - 1)

  return { data: data ?? [], total: count ?? 0 }
}

// ── News ─────────────────────────────────────────────────────────────────────

export async function createNews(data: {
  title: string
  content: string
  category?: string
}): Promise<News> {
  const { data: news, error } = await adminClient()
    .from('news')
    .insert({
      title: data.title,
      content: data.content,
      category: data.category ?? 'general',
      created_by: (await supabase.auth.getUser()).data.user?.id,
    })
    .select()
    .single()

  if (error) throw error
  return news
}

export async function updateNews(id: string, data: Partial<{ title: string; content: string; category: string }>) {
  const { error } = await adminClient()
    .from('news')
    .update(data)
    .eq('id', id)
  if (error) throw error
}

export async function publishNews(id: string) {
  const { error } = await adminClient()
    .from('news')
    .update({ is_published: true })
    .eq('id', id)
  if (error) throw error
}

export async function unpublishNews(id: string) {
  const { error } = await adminClient()
    .from('news')
    .update({ is_published: false })
    .eq('id', id)
  if (error) throw error
}

export async function deleteNews(id: string) {
  const { error } = await adminClient()
    .from('news')
    .delete()
    .eq('id', id)
  if (error) throw error
}

export async function getAllNews(params: {
  page?: number
  limit?: number
} = {}): Promise<{ data: News[]; total: number }> {
  const { page = 1, limit = 20 } = params
  const from = (page - 1) * limit

  const { data, count } = await adminClient()
    .from('news')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, from + limit - 1)

  return { data: data ?? [], total: count ?? 0 }
}

// ── User Notifications (for all users) ──────────────────────────────────────

export async function fetchUserNotifications(userId: string): Promise<Notification[]> {
  const { data } = await supabase
    .from('notifications')
    .select('*')
    .or(`target_users.eq.all,created_by.eq.${userId}`)
    .order('created_at', { ascending: false })
    .limit(50)

  return data ?? []
}

export async function markNotificationRead(notificationId: string, userId: string) {
  const { data: existing } = await supabase
    .from('notifications')
    .select('is_read_by')
    .eq('id', notificationId)
    .single()

  if (!existing) return

  const readBy = Array.isArray(existing.is_read_by) ? existing.is_read_by : []
  if (!readBy.includes(userId)) {
    readBy.push(userId)
  }

  const { error } = await supabase
    .from('notifications')
    .update({ is_read_by: readBy })
    .eq('id', notificationId)

  if (error) throw error
}

export async function getPublishedNews(): Promise<News[]> {
  const { data } = await supabase
    .from('news')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(20)

  return data ?? []
}
