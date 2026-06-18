<template>
  <div class="auth-shell">

    <!-- Left panel — branding / marketing -->
    <div class="auth-left">
      <div class="auth-left-inner">
        <div class="brand-mark">
          <div class="brand-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <polyline points="14,2 14,8 20,8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <span class="brand-name">Invoicer<span>Pro</span></span>
        </div>

        <div class="hero-text">
          <h1>Invoice smarter,<br />get paid faster</h1>
          <p>Professional invoicing for freelancers and small businesses. Create, send, and track invoices in minutes.</p>
        </div>

        <ul class="feature-list">
          <li><span class="feature-dot"></span>Beautiful, professional invoice templates</li>
          <li><span class="feature-dot"></span>Track payments and overdue invoices</li>
          <li><span class="feature-dot"></span>Manage clients and receipts in one place</li>
        </ul>
      </div>
    </div>

    <!-- Right panel — auth form -->
    <div class="auth-right">
      <div class="auth-right-inner">
        <RouterView />
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<style scoped>
.auth-shell {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.auth-left {
  flex: 1;
  background: linear-gradient(140deg, #4f46e5 0%, #7c3aed 60%, #6d28d9 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px;
}

.auth-left-inner {
  max-width: 420px;
  display: flex;
  flex-direction: column;
  gap: 36px;
}

.brand-mark { display: flex; align-items: center; gap: 12px; }

.brand-icon {
  width: 44px;
  height: 44px;
  background: rgba(255,255,255,.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(8px);
}

.brand-icon svg { width: 22px; height: 22px; color: #ffffff; }

.brand-name { font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.4px; }
.brand-name span { color: rgba(255,255,255,.7); }

.hero-text h1 {
  font-size: 36px;
  font-weight: 800;
  color: #ffffff;
  line-height: 1.2;
  letter-spacing: -0.8px;
  margin: 0 0 16px;
}

.hero-text p {
  font-size: 16px;
  color: rgba(255,255,255,.75);
  line-height: 1.6;
  margin: 0;
}

.feature-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.feature-list li {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: rgba(255,255,255,.85);
  font-weight: 500;
}

.feature-dot {
  width: 7px;
  height: 7px;
  min-width: 7px;
  border-radius: 50%;
  background: rgba(255,255,255,.5);
}

.auth-right {
  width: 480px;
  min-width: 480px;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 40px;
  overflow-y: auto;
}

.auth-right-inner {
  width: 100%;
  max-width: 380px;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0,0,0,.08), 0 1px 4px rgba(0,0,0,.04);
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

@media (max-width: 768px) {
  .auth-shell { flex-direction: column; }
  .auth-left {
    flex: none;
    padding: 28px 24px;
    min-height: auto;
    background: linear-gradient(135deg, #4f46e5, #7c3aed);
  }
  .auth-left-inner { gap: 0; }
  .brand-mark { margin-bottom: 0; }
  .hero-text { display: none; }
  .feature-list { display: none; }
  .auth-right {
    width: 100%;
    min-width: 0;
    padding: 32px 16px 24px;
    flex: 1;
  }
  .auth-right-inner {
    max-width: 100%;
    box-shadow: none;
    border: none;
    background: transparent;
  }
}
</style>
