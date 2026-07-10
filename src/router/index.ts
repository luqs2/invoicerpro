import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  { path: '/', redirect: '/app/dashboard' },
  {
    path: '/view-invoice/:slug',
    component: () => import('@/pages/public/PublicInvoicePage.vue'),
  },
  {
    path: '/auth',
    component: () => import('@/layouts/AuthLayout.vue'),
    children: [
      { path: '',         redirect: '/auth/login' },
      { path: 'login',           component: () => import('@/pages/auth/LoginPage.vue') },
      { path: 'register',        component: () => import('@/pages/auth/RegisterPage.vue') },
      { path: 'forgot-password', component: () => import('@/pages/auth/ForgotPasswordPage.vue') },
    ],
  },
  {
    path: '/app',
    component: () => import('@/layouts/AppLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '',               redirect: '/app/dashboard' },
      { path: 'dashboard',      component: () => import('@/pages/dashboard/DashboardPage.vue') },
      { path: 'invoices',       component: () => import('@/pages/invoices/InvoicesPage.vue') },
      { path: 'invoices/new',   component: () => import('@/pages/invoices/InvoiceBuilderPage.vue') },
      { path: 'invoices/:id',   component: () => import('@/pages/invoices/InvoiceBuilderPage.vue') },
      { path: 'receipts',       component: () => import('@/pages/receipts/ReceiptsPage.vue') },
      { path: 'receipts/new',   component: () => import('@/pages/receipts/ReceiptBuilderPage.vue') },
      { path: 'receipts/:id',   component: () => import('@/pages/receipts/ReceiptBuilderPage.vue') },
      { path: 'clients',        component: () => import('@/pages/clients/ClientsPage.vue') },
      { path: 'clients/:id',    component: () => import('@/pages/clients/ClientDetailPage.vue') },
      { path: 'templates',      component: () => import('@/pages/templates/TemplatesPage.vue') },
      { path: 'purchase-orders',         component: () => import('@/pages/purchase-orders/PurchaseOrdersPage.vue') },
      { path: 'purchase-orders/new',     component: () => import('@/pages/purchase-orders/PurchaseOrderBuilderPage.vue') },
      { path: 'purchase-orders/:id',     component: () => import('@/pages/purchase-orders/PurchaseOrderBuilderPage.vue') },
      { path: 'settings',       component: () => import('@/pages/settings/SettingsPage.vue') },
      { path: 'notifications',  component: () => import('@/pages/notifications/NotificationsPage.vue') },
      // Admin routes
      {
        path: 'admin',
        meta: { requiresAdmin: true },
        children: [
          { path: '',                  component: () => import('@/pages/admin/AdminDashboardPage.vue') },
          { path: 'users',            component: () => import('@/pages/admin/AdminUsersPage.vue'), meta: { requiresSuperAdmin: true } },
          { path: 'users/:id',        component: () => import('@/pages/admin/AdminUserDetailPage.vue'), meta: { requiresSuperAdmin: true } },
          { path: 'invoices',         component: () => import('@/pages/admin/AdminInvoicesPage.vue') },
          { path: 'receipts',         component: () => import('@/pages/admin/AdminReceiptsPage.vue') },
          { path: 'purchase-orders',  component: () => import('@/pages/admin/AdminPurchaseOrdersPage.vue') },
          { path: 'notifications',    component: () => import('@/pages/admin/AdminNotificationsPage.vue') },
        ],
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to) => {
  if (!to.meta.requiresAuth) return true

  const { useAuthStore } = await import('@/stores/auth')
  const auth = useAuthStore()

  if (!auth.user) await auth.init()
  if (!auth.user) return '/auth/login'

  // Banned user guard — block access to the entire app
  if (auth.user.role === 'banned') {
    await auth.logout()
    return '/auth/login?banned=1'
  }

  // Admin route guard
  if (to.meta.requiresAdmin && !auth.isAdmin) {
    return '/app/dashboard'
  }

  // Super admin route guard
  if (to.meta.requiresSuperAdmin && !auth.isSuperAdmin) {
    return '/app/admin'
  }

  return true
})

export default router
