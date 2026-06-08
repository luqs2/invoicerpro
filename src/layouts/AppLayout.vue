<template>
  <div class="app-shell">

    <!-- ── Sidebar ─────────────────────────────────────── -->
    <aside class="sidebar" :class="{ collapsed: sidebarCollapsed }">
      <div class="sidebar-header">
        <div class="brand-logo">
          <div class="brand-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <polyline points="14,2 14,8 20,8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <polyline points="10,9 9,9 8,9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <span class="brand-text" v-show="!sidebarCollapsed">
            Invoicer<span>Pro</span>
          </span>
        </div>
        <button class="collapse-btn" @click="sidebarCollapsed = !sidebarCollapsed" title="Toggle sidebar">
          <ion-icon :icon="sidebarCollapsed ? chevronForwardOutline : chevronBackOutline" />
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
          <ion-icon :icon="item.icon" class="nav-icon" />
          <span class="nav-label" v-show="!sidebarCollapsed">{{ item.label }}</span>
          <span v-if="item.badge && !sidebarCollapsed" class="nav-badge">{{ item.badge }}</span>
        </router-link>
      </nav>

      <div class="sidebar-footer" v-show="!sidebarCollapsed">
        <router-link to="/app/settings" class="nav-item" :class="{ active: isActive('/app/settings') }">
          <ion-icon :icon="settingsOutline" class="nav-icon" />
          <span class="nav-label">Settings</span>
        </router-link>
      </div>
    </aside>

    <!-- ── Main content ────────────────────────────────── -->
    <main class="main-content">
      <!-- Mobile top bar -->
      <div class="mobile-topbar">
        <button class="mobile-menu-btn" @click="mobileOpen = !mobileOpen">
          <ion-icon :icon="menuOutline" />
        </button>
        <span class="mobile-brand">Invoicer<span>Pro</span></span>
      </div>

      <RouterView />
    </main>

    <!-- Mobile overlay nav -->
    <transition name="overlay-fade">
      <div v-if="mobileOpen" class="mobile-overlay" @click="mobileOpen = false">
        <aside class="mobile-drawer" @click.stop>
          <div class="sidebar-header">
            <div class="brand-logo">
              <div class="brand-icon">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <span class="brand-text">Invoicer<span>Pro</span></span>
            </div>
            <button class="collapse-btn" @click="mobileOpen = false">
              <ion-icon :icon="closeOutline" />
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
              <ion-icon :icon="item.icon" class="nav-icon" />
              <span class="nav-label">{{ item.label }}</span>
            </router-link>
          </nav>
          <div class="sidebar-footer">
            <router-link to="/app/settings" class="nav-item" :class="{ active: isActive('/app/settings') }" @click="mobileOpen = false">
              <ion-icon :icon="settingsOutline" class="nav-icon" />
              <span class="nav-label">Settings</span>
            </router-link>
          </div>
        </aside>
      </div>
    </transition>

  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, RouterView } from 'vue-router'
import { IonIcon } from '@ionic/vue'
import {
  gridOutline, documentTextOutline, receiptOutline,
  peopleOutline, settingsOutline, colorPaletteOutline,
  chevronBackOutline, chevronForwardOutline,
  menuOutline, closeOutline,
} from 'ionicons/icons'

const route = useRoute()
const sidebarCollapsed = ref(false)
const mobileOpen = ref(false)

const navItems = [
  { path: '/app/dashboard', label: 'Dashboard', icon: gridOutline },
  { path: '/app/invoices',  label: 'Invoices',  icon: documentTextOutline },
  { path: '/app/receipts',  label: 'Receipts',  icon: receiptOutline },
  { path: '/app/clients',   label: 'Clients',   icon: peopleOutline },
  { path: '/app/templates', label: 'Templates', icon: colorPaletteOutline },
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
  background: #f8fafc;
}

/* ── Sidebar ───────────────────────────────────────────────── */
.sidebar {
  width: 220px;
  min-width: 220px;
  background: #ffffff;
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  transition: width .2s ease, min-width .2s ease;
  overflow: hidden;
  z-index: 10;
}

.sidebar.collapsed {
  width: 64px;
  min-width: 64px;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 14px;
  border-bottom: 1px solid #f1f5f9;
  min-height: 64px;
}

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
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
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
  font-size: 16px;
  font-weight: 800;
  color: #0f172a;
  white-space: nowrap;
  letter-spacing: -0.3px;
}

.brand-text span { color: #6366f1; }

.collapse-btn {
  width: 28px;
  height: 28px;
  min-width: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: #f1f5f9;
  border-radius: 6px;
  cursor: pointer;
  color: #64748b;
  font-size: 14px;
  transition: background .12s, color .12s;
}

.collapse-btn:hover { background: #e2e8f0; color: #0f172a; }

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
  border-top: 1px solid #f1f5f9;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 10px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
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
  background: #f1f5f9;
  color: #0f172a;
}

.nav-item.active {
  background: #ede9fe;
  color: #6366f1;
  font-weight: 600;
}

.nav-icon {
  font-size: 18px;
  min-width: 18px;
  flex-shrink: 0;
}

.nav-label { flex: 1; }

.nav-badge {
  background: #6366f1;
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
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  position: sticky;
  top: 0;
  z-index: 20;
  flex-shrink: 0;
}

.mobile-menu-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: #f1f5f9;
  border-radius: 8px;
  cursor: pointer;
  font-size: 20px;
  color: #374151;
}

.mobile-brand {
  font-size: 17px;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.3px;
}

.mobile-brand span { color: #6366f1; }

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
  background: #ffffff;
  display: flex;
  flex-direction: column;
  box-shadow: 4px 0 24px rgba(0,0,0,.12);
}

/* Transitions */
.overlay-fade-enter-active,
.overlay-fade-leave-active { transition: opacity .2s; }
.overlay-fade-enter-from,
.overlay-fade-leave-to { opacity: 0; }

/* ── Responsive breakpoints ────────────────────────────────── */
@media (max-width: 768px) {
  .sidebar { display: none; }
  .mobile-topbar { display: flex; }
  .mobile-overlay { display: block; }
}
</style>
