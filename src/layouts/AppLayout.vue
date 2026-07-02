<template>
  <div class="app-shell">
    <!-- Skip to content -->
    <a
      href="#main-content"
      class="skip-link"
    >Skip to content</a>

    <!-- ── Sidebar ─────────────────────────────────────── -->
    <aside
      class="sidebar"
      :class="{ collapsed: sidebarCollapsed }"
    >
      <div class="sidebar-header">
        <div class="brand-logo">
          <div class="brand-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <polyline
                points="14,2 14,8 20,8"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <line
                x1="16"
                y1="13"
                x2="8"
                y2="13"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
              <line
                x1="16"
                y1="17"
                x2="8"
                y2="17"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
              <polyline
                points="10,9 9,9 8,9"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
          </div>
          <span
            v-show="!sidebarCollapsed"
            class="brand-text"
          >
            Invoicer<span>Pro</span>
          </span>
        </div>
        <button
          class="collapse-btn"
          :aria-label="sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
          @click="sidebarCollapsed = !sidebarCollapsed"
        >
          <ChevronLeft
            v-if="!sidebarCollapsed"
            :size="14"
          />
          <ChevronRight
            v-else
            :size="14"
          />
        </button>
      </div>

      <nav class="sidebar-nav">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="nav-item"
          :class="{ active: isActive(item.path) }"
          :title="sidebarCollapsed ? item.label : ''"
        >
          <component
            :is="item.icon"
            :size="18"
            class="nav-icon"
          />
          <span
            v-show="!sidebarCollapsed"
            class="nav-label"
          >{{ item.label }}</span>
          <span
            v-if="item.badge && !sidebarCollapsed"
            class="nav-badge"
          >{{ item.badge }}</span>
        </router-link>
      </nav>

      <div
        v-show="!sidebarCollapsed"
        class="sidebar-footer"
      >
        <router-link
          to="/app/settings"
          class="nav-item"
          :class="{ active: isActive('/app/settings') }"
        >
          <Settings
            :size="18"
            class="nav-icon"
          />
          <span class="nav-label">Settings</span>
        </router-link>
      </div>
    </aside>

    <!-- ── Main content ────────────────────────────────── -->
    <main
      id="main-content"
      class="main-content"
    >
      <!-- Mobile top bar -->
      <div class="mobile-topbar">
        <button
          class="mobile-menu-btn"
          aria-label="Open navigation menu"
          @click="mobileOpen = !mobileOpen"
        >
          <Menu :size="20" />
        </button>
        <span class="mobile-brand">Invoicer<span>Pro</span></span>
      </div>

      <RouterView />
    </main>

    <!-- Mobile overlay nav -->
    <transition name="overlay-fade">
      <div
        v-if="mobileOpen"
        class="mobile-overlay"
        @click="mobileOpen = false"
      >
        <aside
          class="mobile-drawer"
          @click.stop
        >
          <div class="sidebar-header">
            <div class="brand-logo">
              <div class="brand-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </div>
              <span class="brand-text">Invoicer<span>Pro</span></span>
            </div>
            <button
              class="collapse-btn"
              aria-label="Close navigation menu"
              @click="mobileOpen = false"
            >
              <X :size="16" />
            </button>
          </div>
          <nav class="sidebar-nav">
            <router-link
              v-for="item in navItems"
              :key="item.path"
              :to="item.path"
              class="nav-item"
              :class="{ active: isActive(item.path) }"
              @click="mobileOpen = false"
            >
              <component
                :is="item.icon"
                :size="18"
                class="nav-icon"
              />
              <span class="nav-label">{{ item.label }}</span>
            </router-link>
          </nav>
          <div class="sidebar-footer">
            <router-link
              to="/app/settings"
              class="nav-item"
              :class="{ active: isActive('/app/settings') }"
              @click="mobileOpen = false"
            >
              <Settings
                :size="18"
                class="nav-icon"
              />
              <span class="nav-label">Settings</span>
            </router-link>
          </div>
        </aside>
      </div>
    </transition>

    <!-- Mobile bottom nav -->
    <nav
      v-if="isMobile"
      class="bottom-nav"
    >
      <router-link
        v-for="item in bottomNavItems"
        :key="item.path"
        :to="item.path"
        class="bottom-nav-item"
        :class="{ active: isActive(item.path) }"
      >
        <component
          :is="item.icon"
          :size="20"
        />
        <span>{{ item.label }}</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, RouterView } from 'vue-router'
import {
  LayoutGrid, FileText, Receipt, Users, Palette, ShoppingCart,
  ChevronLeft, ChevronRight,
  Menu, X, Settings,
} from '@lucide/vue'
import { useBusinessProfileStore } from '@/stores/businessProfile'
import { useInvoiceStore } from '@/stores/invoices'
import { useClientStore } from '@/stores/clients'
import { useKeyboardShortcuts } from '@/composables/useKeyboardShortcuts'

interface NavItem {
  path: string
  label: string
  icon: any
  badge?: number
}

const route = useRoute()
const sidebarCollapsed = ref(localStorage.getItem('sidebar-collapsed') === 'true')
const mobileOpen = ref(false)
const isMobile = ref(window.innerWidth <= 768)

function onResize() {
  isMobile.value = window.innerWidth <= 768
}

onMounted(() => window.addEventListener('resize', onResize))
onUnmounted(() => window.removeEventListener('resize', onResize))

watch(sidebarCollapsed, (v) => {
  localStorage.setItem('sidebar-collapsed', String(v))
})

const bpStore = useBusinessProfileStore()
const invoiceStore = useInvoiceStore()
const clientStore = useClientStore()
useKeyboardShortcuts()

onMounted(() => {
  bpStore.fetch()
  invoiceStore.fetchAll()
  clientStore.fetchAll()
  invoiceStore.subscribe()
  clientStore.subscribe()
})

onUnmounted(() => {
  invoiceStore.unsubscribe()
  clientStore.unsubscribe()
})

const navItems: NavItem[] = [
  { path: '/app/dashboard',       label: 'Dashboard',       icon: LayoutGrid },
  { path: '/app/invoices',        label: 'Invoices',        icon: FileText },
  { path: '/app/receipts',        label: 'Receipts',        icon: Receipt },
  { path: '/app/purchase-orders', label: 'Purchase Orders', icon: ShoppingCart },
  { path: '/app/clients',         label: 'Clients',         icon: Users },
  { path: '/app/templates',       label: 'Templates',       icon: Palette },
]

const bottomNavItems: NavItem[] = [
  { path: '/app/dashboard', label: 'Home',    icon: LayoutGrid },
  { path: '/app/invoices',  label: 'Invoices', icon: FileText },
  { path: '/app/clients',   label: 'Clients', icon: Users },
  { path: '/app/settings',  label: 'More',    icon: Settings },
]

function isActive(path: string) {
  return route.path === path || route.path.startsWith(path + '/')
}
</script>

<style scoped>
/* ── Shell layout ──────────────────────────────────────────── */
.app-shell {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background: #EDE8DE;
}
.dark .app-shell { background: #111413; }

/* Skip to content link */
.skip-link {
  position: absolute;
  top: -40px;
  left: 8px;
  z-index: 10000;
  padding: 8px 16px;
  background: #1f3a34;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  border-radius: 0 0 8px 8px;
  text-decoration: none;
  transition: top .2s;
}
.skip-link:focus {
  top: 0;
  outline: 2px solid #1f3a34;
  outline-offset: 2px;
}

/* ── Sidebar ───────────────────────────────────────────────── */
.sidebar {
  width: 220px;
  min-width: 220px;
  background: #F7F4EC;
  border-right: 1px solid #D6D0C2;
  display: flex;
  flex-direction: column;
  transition: width .2s ease, min-width .2s ease;
  overflow: hidden;
  z-index: 10;
}
.dark .sidebar { background: #1d201f; border-color: #404945; }

.sidebar.collapsed {
  width: 64px;
  min-width: 64px;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 14px;
  border-bottom: 1px solid #D6D0C2;
  min-height: 64px;
}
.dark .sidebar-header { border-color: #404945; }

.brand-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  overflow: hidden;
  flex: 1;
  min-width: 0;
}

.brand-icon {
  width: 32px;
  height: 32px;
  min-width: 32px;
  background: #1f3a34;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand-icon svg {
  width: 17px;
  height: 17px;
  color: #ffffff;
}

.brand-text {
  font-family: 'Merriweather', Georgia, serif;
  font-size: 16px;
  font-weight: 700;
  color: #1e1b15;
  white-space: nowrap;
  letter-spacing: -0.3px;
}
.dark .brand-text { color: #e1e3e1; }

.brand-text span { color: #B5652D; }

.collapse-btn {
  width: 28px;
  height: 28px;
  min-width: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: #EDE8DE;
  border-radius: 6px;
  cursor: pointer;
  color: #414846;
  font-size: 14px;
  transition: background .12s, color .12s;
}
.dark .collapse-btn { background: #323534; color: #c0c8c4; }

.collapse-btn:hover { background: #D6D0C2; color: #1e1b15; }
.dark .collapse-btn:hover { background: #404945; color: #e1e3e1; }

/* Nav */
.sidebar-nav {
  flex: 1;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow-y: auto;
}

.sidebar-footer {
  padding: 8px;
  border-top: 1px solid #D6D0C2;
}
.dark .sidebar-footer { border-color: #404945; }

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 10px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #414846;
  text-decoration: none;
  transition: background .12s, color .12s;
  white-space: nowrap;
  overflow: hidden;
  cursor: pointer;
  border: none;
  background: transparent;
  width: 100%;
  text-align: left;
}

.nav-item:hover {
  background: #EDE8DE;
  color: #1e1b15;
}
.dark .nav-item:hover { background: #323534; color: #e1e3e1; }

.nav-item.active {
  background: #EDE8DE;
  color: #08241f;
  font-weight: 600;
  border-left: 3px solid #B5652D;
  padding-left: 7px;
}
.dark .nav-item.active { background: #1f3a34; color: #a0d0c2; }

.nav-icon {
  min-width: 18px;
  flex-shrink: 0;
}

.nav-label { flex: 1; }

.nav-badge {
  background: #B5652D;
  color: #fff;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 700;
  padding: 1px 6px;
  min-width: 18px;
  text-align: center;
}

/* ── Main content ──────────────────────────────────────────── */
.main-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
}

/* ── Mobile ────────────────────────────────────────────────── */
.mobile-topbar {
  display: none;
  align-items: center;
  gap: 12px;
  padding: 0 16px;
  height: 56px;
  background: #F7F4EC;
  border-bottom: 1px solid #D6D0C2;
  position: sticky;
  top: 0;
  z-index: 20;
  flex-shrink: 0;
}
.dark .mobile-topbar { background: #1d201f; border-color: #404945; }

.mobile-menu-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: #EDE8DE;
  border-radius: 8px;
  cursor: pointer;
  font-size: 20px;
  color: #1e1b15;
}
.dark .mobile-menu-btn { background: #323534; color: #c0c8c4; }

.mobile-brand {
  font-family: 'Merriweather', Georgia, serif;
  font-size: 17px;
  font-weight: 700;
  color: #1e1b15;
  letter-spacing: -0.3px;
}
.dark .mobile-brand { color: #e1e3e1; }

.mobile-brand span { color: #B5652D; }

.mobile-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.4);
  z-index: 100;
}

.mobile-drawer {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 260px;
  background: #F7F4EC;
  display: flex;
  flex-direction: column;
  box-shadow: 4px 0 24px rgba(0,0,0,.12);
}
.dark .mobile-drawer { background: #1d201f; }

/* Transitions */
.overlay-fade-enter-active,
.overlay-fade-leave-active { transition: opacity .2s; }
.overlay-fade-enter-from,
.overlay-fade-leave-to { opacity: 0; }

/* ── Responsive breakpoints ────────────────────────────────── */
.bottom-nav {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #F7F4EC;
  border-top: 1px solid #D6D0C2;
  z-index: 50;
  padding: 6px 0 env(safe-area-inset-bottom, 8px);
}
.dark .bottom-nav { background: #1d201f; border-color: #404945; }

.bottom-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  font-size: 10px;
  font-weight: 600;
  color: #414846;
  text-decoration: none;
  padding: 4px 0;
  transition: color .12s;
  flex: 1;
}
.bottom-nav-item.active { color: #B5652D; }
.dark .bottom-nav-item { color: #c0c8c4; }
.dark .bottom-nav-item.active { color: #ffb787; }

@media (max-width: 768px) {
  .sidebar { display: none; }
  .mobile-topbar { display: flex; }
  .mobile-overlay { display: block; }
  .bottom-nav { display: flex; }
  .main-content { padding-bottom: 60px; }
}
</style>