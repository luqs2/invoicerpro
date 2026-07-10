import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import type { AdminRole } from '@/types'

// ── Permission definitions ────────────────────────────────────────────────────

export type Permission =
  // Dashboard
  | 'view_admin_dashboard'
  | 'view_all_stats'
  // Users
  | 'view_all_users'
  | 'manage_user_roles'
  | 'ban_users'
  | 'delete_users'
  | 'view_user_details'
  // Notifications
  | 'send_notifications'
  | 'manage_news'
  // Documents
  | 'view_all_invoices'
  | 'view_all_receipts'
  | 'view_all_purchase_orders'
  | 'export_all_data'
  // Settings
  | 'manage_platform_settings'

// ── Role → Permissions mapping ────────────────────────────────────────────────

const ROLE_PERMISSIONS: Record<AdminRole, Permission[]> = {
  user: [],
  banned: [],

  viewer: [
    'view_admin_dashboard',
    'view_all_stats',
    'view_all_invoices',
    'view_all_receipts',
    'view_all_purchase_orders',
    'view_user_details',
  ],

  admin: [
    'view_admin_dashboard',
    'view_all_stats',
    // Users
    'view_all_users',
    'view_user_details',
    // Notifications
    'send_notifications',
    'manage_news',
    // Documents
    'view_all_invoices',
    'view_all_receipts',
    'view_all_purchase_orders',
    'export_all_data',
  ],

  super_admin: [
    'view_admin_dashboard',
    'view_all_stats',
    // Users
    'view_all_users',
    'manage_user_roles',
    'ban_users',
    'delete_users',
    'view_user_details',
    // Notifications
    'send_notifications',
    'manage_news',
    // Documents
    'view_all_invoices',
    'view_all_receipts',
    'view_all_purchase_orders',
    'export_all_data',
    // Settings
    'manage_platform_settings',
  ],
}

// ── Permission labels (for UI) ────────────────────────────────────────────────

export const PERMISSION_LABELS: Record<Permission, { label: string; description: string }> = {
  view_admin_dashboard: { label: 'View Dashboard', description: 'Access the admin dashboard overview' },
  view_all_stats: { label: 'View Statistics', description: 'See platform-wide statistics and charts' },
  view_all_users: { label: 'View Users', description: 'List and search all registered users' },
  manage_user_roles: { label: 'Manage Roles', description: 'Change user roles (admin, viewer, etc.)' },
  ban_users: { label: 'Ban Users', description: 'Ban users from accessing the platform' },
  delete_users: { label: 'Delete Users', description: 'Permanently delete user accounts' },
  view_user_details: { label: 'View User Details', description: 'See detailed user profile and activity' },
  send_notifications: { label: 'Send Notifications', description: 'Push notifications to users' },
  manage_news: { label: 'Manage News', description: 'Create, publish, and delete news posts' },
  view_all_invoices: { label: 'View All Invoices', description: 'Access platform-wide invoice data' },
  view_all_receipts: { label: 'View All Receipts', description: 'Access platform-wide receipt data' },
  view_all_purchase_orders: { label: 'View All POs', description: 'Access platform-wide purchase order data' },
  export_all_data: { label: 'Export Data', description: 'Export CSV files from admin panels' },
  manage_platform_settings: { label: 'Manage Settings', description: 'Configure platform-wide settings' },
}

// ── Role labels ───────────────────────────────────────────────────────────────

export const ROLE_LABELS: Record<AdminRole, { label: string; description: string; permissions: Permission[] }> = {
  user: { label: 'User', description: 'Regular platform user with no admin access', permissions: [] },
  banned: { label: 'Banned', description: 'User has been banned from the platform', permissions: [] },
  viewer: { label: 'Viewer', description: 'Read-only access to admin dashboard and reports', permissions: ROLE_PERMISSIONS.viewer },
  admin: { label: 'Admin', description: 'Can view data, send notifications, and manage news', permissions: ROLE_PERMISSIONS.admin },
  super_admin: { label: 'Super Admin', description: 'Full access including user management and settings', permissions: ROLE_PERMISSIONS.super_admin },
}

// ── Composable ────────────────────────────────────────────────────────────────

export function usePermissions() {
  const auth = useAuthStore()

  const role = computed(() => auth.user?.role ?? 'user')

  const permissions = computed<Permission[]>(() => {
    return ROLE_PERMISSIONS[role.value] ?? []
  })

  function hasPermission(perm: Permission): boolean {
    return permissions.value.includes(perm)
  }

  function hasAny(...perms: Permission[]): boolean {
    return perms.some(p => permissions.value.includes(p))
  }

  function hasAll(...perms: Permission[]): boolean {
    return perms.every(p => permissions.value.includes(p))
  }

  // Convenience computed properties for common checks
  const canViewDashboard = computed(() => hasPermission('view_admin_dashboard'))
  const canManageUsers = computed(() => hasPermission('manage_user_roles'))
  const canBanUsers = computed(() => hasPermission('ban_users'))
  const canDeleteUsers = computed(() => hasPermission('delete_users'))
  const canSendNotifications = computed(() => hasPermission('send_notifications'))
  const canManageNews = computed(() => hasPermission('manage_news'))
  const canExportData = computed(() => hasPermission('export_all_data'))
  const canManageSettings = computed(() => hasPermission('manage_platform_settings'))

  return {
    role,
    permissions,
    hasPermission,
    hasAny,
    hasAll,
    canViewDashboard,
    canManageUsers,
    canBanUsers,
    canDeleteUsers,
    canSendNotifications,
    canManageNews,
    canExportData,
    canManageSettings,
  }
}
