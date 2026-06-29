<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="page-title">
          Settings
        </h1>
        <p class="page-sub">
          Manage your business profile and preferences
        </p>
      </div>
      <button
        class="btn-primary"
        :disabled="saving"
        @click="saveProfile"
      >
        <span
          v-if="saving"
          class="spinner"
        />
        {{ saving ? 'Saving…' : 'Save Changes' }}
      </button>
    </div>

    <div
      v-if="!loading"
      class="settings-layout"
    >
      <!-- Left column -->
      <div class="settings-main">
        <!-- Business Profile -->
        <div class="settings-card">
          <div class="card-header">
            <h2 class="card-title">
              Business Profile
            </h2>
            <p class="card-desc">
              This info appears on your invoices and receipts.
            </p>
          </div>
          <div class="card-body">
            <!-- Logo upload -->
            <div class="logo-section">
              <div
                class="logo-preview"
                @click="triggerLogoUpload"
              >
                <img
                  v-if="form.logo_url"
                  :src="form.logo_url"
                  alt="Business logo"
                  class="logo-img"
                >
                <div
                  v-else
                  class="logo-initials"
                >
                  {{ nameInitials }}
                </div>
                <div class="logo-overlay">
                  <Upload :size="18" />
                  <span>{{ form.logo_url ? 'Change' : 'Upload' }}</span>
                </div>
              </div>
              <div class="logo-info">
                <p class="logo-hint">
                  PNG, JPG, or SVG · Max 2 MB
                </p>
                <button
                  v-if="form.logo_url"
                  class="logo-remove"
                  @click="form.logo_url = ''"
                >
                  Remove logo
                </button>
              </div>
              <input
                ref="logoInput"
                type="file"
                accept="image/png,image/jpeg,image/svg+xml,image/webp"
                style="display:none"
                @change="handleLogoUpload"
              >
            </div>

            <div class="field-row">
              <div class="field">
                <label>Business Name</label>
                <UiInput
                  v-model="form.name"
                  placeholder="Acme Co."
                />
              </div>
              <div class="field">
                <label>Email</label>
                <UiInput
                  v-model="form.email"
                  type="email"
                  placeholder="hello@acme.com"
                />
              </div>
            </div>

            <div class="field-row">
              <div class="field">
                <label>Phone</label>
                <UiInput
                  v-model="form.phone"
                  placeholder="+60 12-345 6789"
                />
              </div>
              <div class="field">
                <label>Address</label>
                <UiInput
                  v-model="form.address"
                  placeholder="123 Main St, City"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Invoice & Receipt Defaults -->
        <div class="settings-card">
          <div class="card-header">
            <h2 class="card-title">
              Invoice & Receipt Defaults
            </h2>
            <p class="card-desc">
              Applied automatically when you create new documents.
            </p>
          </div>
          <div class="card-body">
            <div class="field-row">
              <div class="field">
                <label>Default Currency</label>
                <UiSelect
                  v-model="form.default_currency"
                  :options="currencyOptions"
                />
              </div>
              <div class="field">
                <label>Default Tax Rate (%)</label>
                <UiInput
                  v-model="form.default_tax_rate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                />
              </div>
            </div>
            <div class="field-row">
              <div class="field">
                <label>Invoice Prefix</label>
                <UiInput
                  v-model="form.invoice_prefix"
                  placeholder="INV"
                />
              </div>
              <div class="field">
                <label>Receipt Prefix</label>
                <UiInput
                  v-model="form.receipt_prefix"
                  placeholder="RCP"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right column -->
      <div class="settings-aside">
        <!-- Preview card -->
        <div class="settings-card">
          <div class="card-header">
            <h2 class="card-title">
              Preview
            </h2>
            <p class="card-desc">
              How your business appears on documents.
            </p>
          </div>
          <div class="preview-body">
            <div class="preview-logo-wrap">
              <img
                v-if="form.logo_url"
                :src="form.logo_url"
                alt="logo"
                class="preview-logo-img"
              >
              <div
                v-else
                class="preview-logo-initials"
              >
                {{ nameInitials }}
              </div>
            </div>
            <p class="preview-name">
              {{ form.name || 'Your Business Name' }}
            </p>
            <p class="preview-email">
              {{ form.email || 'your@email.com' }}
            </p>
            <p
              v-if="form.address"
              class="preview-address"
            >
              {{ form.address }}
            </p>
          </div>
        </div>

        <!-- Account -->
        <div class="settings-card">
          <div class="card-header">
            <h2 class="card-title">
              Account
            </h2>
          </div>
          <div
            class="card-body"
            style="padding-top:0"
          >
            <div class="theme-toggle-row">
              <span class="theme-label">Appearance</span>
              <button
                class="theme-toggle"
                :aria-label="`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`"
                @click="toggleTheme"
              >
                <Sun
                  v-if="theme === 'dark'"
                  :size="16"
                />
                <Moon
                  v-else
                  :size="16"
                />
                <span>{{ theme === 'light' ? 'Dark' : 'Light' }} mode</span>
              </button>
            </div>
            <button
              class="danger-btn"
              @click="logout"
            >
              <LogOut :size="16" />
              Sign Out
            </button>
          </div>
        </div>

        <div class="info-card">
          <p class="info-title">
            InvoicerPro
          </p>
          <p class="info-version">
            Version 0.1.0
          </p>
        </div>
      </div>
    </div>

    <!-- Skeleton loading state -->
    <div
      v-else
      class="settings-layout"
    >
      <div class="settings-main">
        <div class="settings-card">
          <div class="card-header">
            <Skeleton
              variant="text"
              width="120px"
            />
          </div>
          <div class="card-body">
            <div class="logo-section">
              <Skeleton
                variant="rect"
                width="72px"
                height="72px"
                style="border-radius:14px; flex-shrink:0;"
              />
              <div style="display:flex; flex-direction:column; gap:4px;">
                <Skeleton
                  variant="text"
                  width="140px"
                />
                <Skeleton
                  variant="text"
                  width="100px"
                />
              </div>
            </div>
            <div class="field-row">
              <div class="field">
                <Skeleton
                  variant="text"
                  width="60px"
                /><Skeleton
                  variant="rect"
                  height="38px"
                  style="border-radius:9px;"
                />
              </div>
              <div class="field">
                <Skeleton
                  variant="text"
                  width="40px"
                /><Skeleton
                  variant="rect"
                  height="38px"
                  style="border-radius:9px;"
                />
              </div>
            </div>
            <div class="field-row">
              <div class="field">
                <Skeleton
                  variant="text"
                  width="40px"
                /><Skeleton
                  variant="rect"
                  height="38px"
                  style="border-radius:9px;"
                />
              </div>
              <div class="field">
                <Skeleton
                  variant="text"
                  width="50px"
                /><Skeleton
                  variant="rect"
                  height="38px"
                  style="border-radius:9px;"
                />
              </div>
            </div>
          </div>
        </div>
        <div class="settings-card">
          <div class="card-header">
            <Skeleton
              variant="text"
              width="180px"
            />
          </div>
          <div class="card-body">
            <div class="field-row">
              <div class="field">
                <Skeleton
                  variant="text"
                  width="100px"
                /><Skeleton
                  variant="rect"
                  height="38px"
                  style="border-radius:9px;"
                />
              </div>
              <div class="field">
                <Skeleton
                  variant="text"
                  width="110px"
                /><Skeleton
                  variant="rect"
                  height="38px"
                  style="border-radius:9px;"
                />
              </div>
            </div>
            <div class="field-row">
              <div class="field">
                <Skeleton
                  variant="text"
                  width="90px"
                /><Skeleton
                  variant="rect"
                  height="38px"
                  style="border-radius:9px;"
                />
              </div>
              <div class="field">
                <Skeleton
                  variant="text"
                  width="90px"
                /><Skeleton
                  variant="rect"
                  height="38px"
                  style="border-radius:9px;"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="settings-aside">
        <div class="settings-card">
          <div class="card-header">
            <Skeleton
              variant="text"
              width="60px"
            />
          </div>
          <div class="preview-body">
            <Skeleton
              variant="circle"
              width="56px"
              height="56px"
            />
            <Skeleton
              variant="text"
              width="120px"
            />
            <Skeleton
              variant="text"
              width="160px"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Upload, LogOut, Sun, Moon } from '@lucide/vue'
import { useAuthStore }            from '@/stores/auth'
import { useBusinessProfileStore } from '@/stores/businessProfile'
import { useToast }                from '@/composables/useToast'
import { useTheme }                 from '@/composables/useTheme'
import { useMinDelay }              from '@/composables/useMinDelay'
import UiSelect from '@/components/ui/Select.vue'
import UiInput from '@/components/ui/Input.vue'
import Skeleton from '@/components/ui/Skeleton.vue'

const auth          = useAuthStore()
const bpStore       = useBusinessProfileStore()
const { showToast } = useToast()
const router        = useRouter()
const { theme, toggleTheme } = useTheme()
const { loading, wrap } = useMinDelay()

const saving    = ref(false)
const logoInput = ref<HTMLInputElement | null>(null)

const form = reactive({
  name:              '',
  email:             '',
  phone:             '',
  address:           '',
  logo_url:          '',
  default_currency:  'MYR',
  default_tax_rate:  6,
  invoice_prefix:    'INV',
  receipt_prefix:    'RCP',
})

const currencyOptions = [
  { value: 'MYR', label: 'MYR — Malaysian Ringgit (RM)' },
  { value: 'USD', label: 'USD — US Dollar ($)' },
  { value: 'SGD', label: 'SGD — Singapore Dollar (S$)' },
  { value: 'EUR', label: 'EUR — Euro (€)' },
  { value: 'GBP', label: 'GBP — British Pound (£)' },
]

const nameInitials = computed(() => {
  const n = form.name.trim()
  if (!n) return '?'
  return n.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
})

onMounted(async () => {
  await wrap(bpStore.fetch())
  const p = bpStore.profile
  form.name             = p.name             ?? ''
  form.email            = p.email            ?? ''
  form.phone            = p.phone            ?? ''
  form.address          = p.address          ?? ''
  form.logo_url         = p.logo_url         ?? ''
  form.default_currency = p.default_currency ?? 'MYR'
  form.default_tax_rate = p.default_tax_rate ?? 6
  form.invoice_prefix   = p.invoice_prefix   ?? 'INV'
  form.receipt_prefix   = p.receipt_prefix   ?? 'RCP'
})

function triggerLogoUpload() {
  logoInput.value?.click()
}

async function handleLogoUpload(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  if (file.size > 2 * 1024 * 1024) {
    showToast('Logo must be under 2 MB', 'danger')
    return
  }
  saving.value = true
  try {
    const url = await bpStore.uploadLogo(file)
    form.logo_url = url
    showToast('Logo uploaded!')
  } catch (err: any) {
    showToast(err?.message ?? 'Logo upload failed', 'danger')
  } finally {
    saving.value = false
    // Reset so the same file can be re-uploaded if needed
    if (logoInput.value) logoInput.value.value = ''
  }
}

async function saveProfile() {
  if (!form.name.trim()) { showToast('Business name is required', 'danger'); return }
  saving.value = true
  try {
    await bpStore.save({
      name:             form.name.trim(),
      email:            form.email.trim(),
      phone:            form.phone.trim() || undefined,
      address:          form.address.trim() || undefined,
      logo_url:         form.logo_url || undefined,
      default_currency: form.default_currency,
      default_tax_rate: Number(form.default_tax_rate),
      invoice_prefix:   form.invoice_prefix.trim() || 'INV',
      receipt_prefix:   form.receipt_prefix.trim() || 'RCP',
    } as any)
    showToast('Profile saved!')
  } catch (err: any) {
    showToast(err?.message ?? 'Failed to save profile', 'danger')
  } finally {
    saving.value = false
  }
}

async function logout() {
  await auth.logout()
  router.replace('/auth/login')
}
</script>

<style scoped>
.page { gap: 24px; }

/* Settings layout */
.settings-layout {
  display: grid;
  grid-template-columns: 1fr 260px;
  gap: 20px;
  align-items: start;
}
.settings-main  { display: flex; flex-direction: column; gap: 20px; }
.settings-aside { display: flex; flex-direction: column; gap: 16px; position: sticky; top: 20px; }

/* Settings cards */
.settings-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,.05);
  overflow: hidden;
}
.card-header  { padding: 18px 22px 14px; border-bottom: 1px solid #f1f5f9; }
.card-title   { font-size: 15px; font-weight: 700; color: #0f172a; margin: 0 0 2px; }
.card-desc    { font-size: 12px; color: #94a3b8; margin: 0; }
.card-body    { padding: 18px 22px; display: flex; flex-direction: column; gap: 16px; }

/* Logo upload */
.logo-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.logo-preview {
  position: relative;
  width: 72px;
  height: 72px;
  border-radius: 14px;
  border: 2px dashed #e2e8f0;
  cursor: pointer;
  overflow: hidden;
  flex-shrink: 0;
  transition: border-color .15s;
  background: #f8fafc;
}
.logo-preview:hover { border-color: #6366f1; }
.logo-preview:hover .logo-overlay { opacity: 1; }

.logo-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 4px;
}

.logo-initials {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 22px;
  color: #6366f1;
  background: #eef2ff;
}

.logo-overlay {
  position: absolute;
  inset: 0;
  background: rgba(99,102,241,.75);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  opacity: 0;
  transition: opacity .15s;
}

.logo-info    { display: flex; flex-direction: column; gap: 4px; }
.logo-hint    { font-size: 12px; color: #94a3b8; margin: 0; }
.logo-remove  {
  background: none; border: none; padding: 0;
  font-size: 12px; color: #ef4444; cursor: pointer;
  font-family: inherit; text-align: left;
}
.logo-remove:hover { text-decoration: underline; }

/* Settings-specific field overrides */
.settings-card .field label {
  font-size: 12px; font-weight: 700; color: #64748b;
  text-transform: uppercase; letter-spacing: 0.4px;
}

/* Preview card */
.preview-body {
  padding: 16px 22px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  text-align: center;
}
.preview-logo-wrap    { margin-bottom: 4px; }
.preview-logo-img     { width: 56px; height: 56px; object-fit: contain; border-radius: 10px; border: 1px solid #e2e8f0; padding: 4px; }
.preview-logo-initials {
  width: 56px; height: 56px;
  border-radius: 10px;
  background: #eef2ff;
  display: flex; align-items: center; justify-content: center;
  font-weight: 800; font-size: 20px; color: #6366f1;
}
.preview-name    { font-size: 14px; font-weight: 700; color: #0f172a; margin: 0; }
.preview-email   { font-size: 12px; color: #64748b; margin: 0; }
.preview-address { font-size: 11px; color: #94a3b8; margin: 0; white-space: pre-line; }

/* Buttons */
.btn-primary {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 10px 24px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff; border: none; border-radius: 10px;
  font-size: 14px; font-weight: 600; cursor: pointer;
  font-family: inherit; transition: opacity .15s;
  box-shadow: 0 2px 10px rgba(99,102,241,.35);
}
.btn-primary:hover:not(:disabled) { opacity: .9; }
.btn-primary:disabled { opacity: .6; cursor: not-allowed; }

.danger-btn {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 14px; width: 100%;
  background: #fff5f5; border: 1.5px solid #fecaca;
  border-radius: 9px; font-size: 14px; font-weight: 600;
  color: #ef4444; cursor: pointer; font-family: inherit;
  transition: background .12s;
}
.danger-btn:hover { background: #fee2e2; }

.theme-toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 0;
}

.theme-label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.theme-toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  cursor: pointer;
  font-family: inherit;
  transition: all .12s;
}
.theme-toggle:hover { background: #f8fafc; border-color: #c7d2fe; }

.info-card    { padding: 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; }
.info-title   { font-size: 13px; font-weight: 700; color: #374151; margin: 0 0 2px; }
.info-version { font-size: 12px; color: #94a3b8; margin: 0; }

@media (max-width: 900px) {
  .settings-layout { grid-template-columns: 1fr; }
  .settings-aside  { position: static; }
}
@media (max-width: 768px) {
  .page-header { flex-direction: column; align-items: flex-start; }
}
</style>
