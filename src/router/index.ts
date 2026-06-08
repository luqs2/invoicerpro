import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  { path: '/', redirect: '/app/dashboard' },
  {
    path: '/auth',
    component: () => import('@/layouts/AuthLayout.vue'),
    children: [
      { path: '',         redirect: '/auth/login' },
      { path: 'login',    component: () => import('@/pages/auth/LoginPage.vue') },
      { path: 'register', component: () => import('@/pages/auth/RegisterPage.vue') },
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
      { path: 'settings',       component: () => import('@/pages/settings/SettingsPage.vue') },
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
  return true
})

export default router
