<template>
  <div class="page">

    <div class="page-header">
      <div>
        <h1 class="page-title">Settings</h1>
        <p class="page-sub">Manage your business profile and preferences</p>
      </div>
    </div>

    <div class="settings-layout">

      <!-- Left column -->
      <div class="settings-main">

        <!-- Business Profile -->
        <div class="settings-card">
          <div class="card-header">
            <h2 class="card-title">Business Profile</h2>
            <p class="card-desc">This info appears on your invoices and receipts.</p>
          </div>
          <div class="card-body">
            <div class="field-row">
              <div class="field">
                <label>Business Name</label>
                <input v-model="profile.name" placeholder="Acme Co." />
              </div>
              <div class="field">
                <label>Email</label>
                <input type="email" v-model="profile.email" placeholder="hello@acme.com" />
              </div>
            </div>
            <div class="field-row">
              <div class="field">
                <label>Phone</label>
                <input v-model="profile.phone" placeholder="+1 (555) 000-0000" />
              </div>
              <div class="field">
                <label>Website</label>
                <input v-model="profile.website" placeholder="https://acme.com" />
              </div>
            </div>
            <div class="field">
              <label>Address</label>
              <textarea v-model="profile.address" placeholder="123 Main St, City, Country" rows="2" />
            </div>
          </div>
        </div>

        <!-- Invoice Defaults -->
        <div class="settings-card">
          <div class="card-header">
            <h2 class="card-title">Invoice Defaults</h2>
            <p class="card-desc">Applied automatically when you create new invoices.</p>
          </div>
          <div class="card-body">
            <div class="field-row">
              <div class="field">
                <label>Default Currency</label>
                <UiSelect v-model="profile.default_currency" :options="currencyOptions" />
              </div>
              <div class="field">
                <label>Invoice Prefix</label>
                <input v-model="profile.invoice_prefix" placeholder="INV" />
              </div>
            </div>
            <div class="field" style="max-width: 200px;">
              <label>Default Tax Rate (%)</label>
              <input type="number" v-model="profile.default_tax_rate" min="0" max="100" step="0.5" />
            </div>
          </div>
        </div>

        <!-- Save button -->
        <div class="form-actions">
          <button class="btn-primary" @click="saveProfile">Save Changes</button>
        </div>

      </div>

      <!-- Right column -->
      <div class="settings-aside">

        <!-- Account -->
        <div class="settings-card">
          <div class="card-header">
            <h2 class="card-title">Account</h2>
          </div>
          <div class="card-body" style="padding-top: 0;">
            <button class="danger-btn" @click="logout">
              <ion-icon :icon="logOutOutline" />
              Sign Out
            </button>
          </div>
        </div>

        <!-- Version info -->
        <div class="info-card">
          <p class="info-title">InvoicerPro</p>
          <p class="info-version">Version 0.1.0</p>
        </div>

      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { IonIcon } from '@ionic/vue'
import { logOutOutline } from 'ionicons/icons'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import { useRouter } from 'vue-router'
import UiSelect from '@/components/ui/Select.vue'

const auth = useAuthStore()
const { showToast } = useToast()
const router = useRouter()

const profile = reactive({
  name: '',
  email: '',
  phone: '',
  website: '',
  address: '',
  default_currency: 'MYR',
  default_tax_rate: 6,
  invoice_prefix: 'INV',
})

const currencyOptions = [
  { value: 'MYR', label: 'MYR — Malaysian Ringgit (RM)' },
  { value: 'USD', label: 'USD — US Dollar ($)' },
  { value: 'SGD', label: 'SGD — Singapore Dollar (S$)' },
  { value: 'EUR', label: 'EUR — Euro (€)' },
  { value: 'GBP', label: 'GBP — British Pound (£)' },
]

async function saveProfile() {
  showToast('Profile saved!')
}

async function logout() {
  await auth.logout()
  router.replace('/auth/login')
}
</script>

<style scoped>
.page {
  padding: 32px 36px;
  max-width: 1200px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.page-header { display: flex; align-items: flex-end; justify-content: space-between; }
.page-title {
  font-size: 26px;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 2px;
  letter-spacing: -0.5px;
}
.page-sub { font-size: 13px; color: #94a3b8; margin: 0; font-weight: 500; }

/* Layout */
.settings-layout {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 20px;
  align-items: start;
}

.settings-main {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.settings-aside {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Cards */
.settings-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,.05);
  overflow: hidden;
}

.card-header {
  padding: 20px 24px 16px;
  border-bottom: 1px solid #f1f5f9;
}

.card-title {
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 2px;
  letter-spacing: -0.1px;
}

.card-desc {
  font-size: 13px;
  color: #94a3b8;
  margin: 0;
}

.card-body {
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Fields */
.field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field label {
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.field input,
.field textarea {
  padding: 9px 12px;
  border: 1.5px solid #e2e8f0;
  border-radius: 9px;
  font-size: 14px;
  color: #0f172a;
  background: #f8fafc;
  outline: none;
  font-family: inherit;
  resize: none;
  transition: border-color .15s, box-shadow .15s;
}
.field input:focus,
.field textarea:focus {
  border-color: #6366f1;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(99,102,241,.1);
}
.field input::placeholder,
.field textarea::placeholder { color: #94a3b8; }

/* Form actions */
.form-actions { display: flex; justify-content: flex-end; }

/* Buttons */
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 10px 24px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #ffffff;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: opacity .15s, transform .1s;
  box-shadow: 0 2px 10px rgba(99,102,241,.35);
}
.btn-primary:hover { opacity: .9; }
.btn-primary:active { transform: scale(.98); }

.danger-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  width: 100%;
  background: #fff5f5;
  border: 1.5px solid #fecaca;
  border-radius: 9px;
  font-size: 14px;
  font-weight: 600;
  color: #ef4444;
  cursor: pointer;
  font-family: inherit;
  transition: background .12s;
}
.danger-btn:hover { background: #fee2e2; }
.danger-btn ion-icon { font-size: 18px; }

/* Info card */
.info-card {
  padding: 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
}
.info-title { font-size: 13px; font-weight: 700; color: #374151; margin: 0 0 2px; }
.info-version { font-size: 12px; color: #94a3b8; margin: 0; }

/* Responsive */
@media (max-width: 900px) {
  .settings-layout { grid-template-columns: 1fr; }
}
@media (max-width: 768px) {
  .page { padding: 20px 16px; }
  .page-title { font-size: 20px; }
  .field-row { grid-template-columns: 1fr; }
}
</style>
