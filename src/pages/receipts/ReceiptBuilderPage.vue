<template>
  <div class="page">

    <div class="page-header">
      <div class="header-left">
        <router-link to="/app/receipts" class="back-link">
          <ArrowLeft :size="16" />
          Receipts
        </router-link>
        <h1 class="page-title">New Receipt</h1>
      </div>
      <UiButton @click="save" :loading="saving">Save Receipt</UiButton>
    </div>

    <div class="builder-layout">
      <div class="form-col">

        <div class="form-card">
          <div class="card-header">
            <h2 class="card-title">Receipt Details</h2>
          </div>
          <div class="card-body">
            <div class="field-row">
              <div class="field">
                <label>Client</label>
                <UiSelect
                  v-model="form.client_id"
                  :options="clientOptions"
                  placeholder="Select client…"
                />
              </div>
              <div class="field">
                <label>Currency</label>
                <UiSelect
                  v-model="form.currency"
                  :options="currencyOptions"
                  placeholder="Select currency"
                />
              </div>
            </div>

            <div class="field-row">
              <div class="field">
                <label>Amount</label>
                <UiInput v-model="form.amount" type="number" placeholder="0.00" />
              </div>
              <div class="field">
                <label>Payment Date</label>
                <UiInput v-model="form.payment_date" type="date" />
              </div>
            </div>

            <div class="field">
              <label>Payment Method</label>
              <UiSelect
                v-model="form.payment_method"
                :options="paymentMethodOptions"
                placeholder="Select method…"
              />
            </div>

            <div class="field">
              <label>Notes</label>
              <UiTextarea v-model="form.notes" placeholder="Additional notes…" :rows="3" />
            </div>
          </div>
        </div>

      </div>

      <!-- Summary aside -->
      <div class="aside-col">
        <div class="summary-card">
          <div class="card-header">
            <h2 class="card-title">Summary</h2>
          </div>
          <div class="summary-body">
            <div class="s-row">
              <span class="s-label">Client</span>
              <span class="s-value">{{ selectedClientName }}</span>
            </div>
            <div class="s-row">
              <span class="s-label">Method</span>
              <span class="s-value">{{ selectedMethodLabel }}</span>
            </div>
            <div class="s-row">
              <span class="s-label">Date</span>
              <span class="s-value">{{ form.payment_date || '—' }}</span>
            </div>
            <div class="s-divider" />
            <div class="s-row s-total">
              <span class="s-label">Amount</span>
              <span class="s-value">{{ form.currency }} {{ Number(form.amount).toLocaleString(undefined, { minimumFractionDigits: 2 }) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft } from '@lucide/vue'
import { useClientStore } from '@/stores/clients'
import { receiptService } from '@/services/receipts'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import UiButton from '@/components/ui/Button.vue'
import UiSelect from '@/components/ui/Select.vue'
import UiInput from '@/components/ui/Input.vue'
import UiTextarea from '@/components/ui/Textarea.vue'

const router      = useRouter()
const clientStore = useClientStore()
const auth        = useAuthStore()
const { showToast } = useToast()

const saving = ref(false)

const form = reactive({
  client_id:      '',
  amount:         0,
  payment_date:   new Date().toISOString().split('T')[0],
  payment_method: 'bank_transfer',
  notes:          '',
  currency:       'MYR',
})

const currencyOptions = [
  { value: 'MYR', label: 'MYR — Malaysian Ringgit' },
  { value: 'USD', label: 'USD — US Dollar' },
  { value: 'SGD', label: 'SGD — Singapore Dollar' },
  { value: 'EUR', label: 'EUR — Euro' },
  { value: 'GBP', label: 'GBP — British Pound' },
]

const paymentMethodOptions = [
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'cash',          label: 'Cash' },
  { value: 'online',        label: 'Online Payment' },
  { value: 'card',          label: 'Card' },
]

const clientOptions = computed(() =>
  clientStore.clients.map(c => ({ value: c.id, label: c.name }))
)

const selectedClientName = computed(() =>
  clientStore.clients.find(c => c.id === form.client_id)?.name ?? '—'
)

const selectedMethodLabel = computed(() =>
  paymentMethodOptions.find(m => m.value === form.payment_method)?.label ?? '—'
)

onMounted(() => clientStore.fetchAll())

async function save() {
  if (!auth.user) return
  saving.value = true
  try {
    const num = 'RCP-' + String(Math.floor(Math.random() * 9000) + 1000)
    await receiptService.create({ ...form, user_id: auth.user.id, receipt_number: num } as any)
    showToast('Receipt saved!')
    router.back()
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.page {
  padding: 32px 36px;
  max-width: 960px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.header-left { display: flex; flex-direction: column; gap: 4px; }

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  text-decoration: none;
  transition: color .12s;
}
.back-link:hover { color: #6366f1; }

.page-title { font-size: 24px; font-weight: 800; color: #0f172a; margin: 0; letter-spacing: -0.5px; }

.builder-layout {
  display: grid;
  grid-template-columns: 1fr 240px;
  gap: 20px;
  align-items: start;
}

.form-col { display: flex; flex-direction: column; gap: 16px; }

.form-card, .summary-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  box-shadow: 0 1px 3px rgba(0,0,0,.05);
  overflow: hidden;
}

.card-header {
  padding: 14px 20px 12px;
  border-bottom: 1px solid #f1f5f9;
}

.card-title { font-size: 14px; font-weight: 700; color: #0f172a; margin: 0; }

.card-body {
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.field { display: flex; flex-direction: column; gap: 5px; }

.field label {
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

/* Summary */
.aside-col { position: sticky; top: 20px; }

.summary-body {
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.s-row { display: flex; justify-content: space-between; font-size: 13px; }
.s-label { color: #64748b; }
.s-value { font-weight: 600; color: #0f172a; }
.s-divider { height: 1px; background: #f1f5f9; margin: 2px 0; }
.s-total .s-label { font-weight: 700; color: #0f172a; font-size: 14px; }
.s-total .s-value { font-size: 15px; font-weight: 800; color: #6366f1; }

@media (max-width: 768px) {
  .page { padding: 20px 16px; }
  .builder-layout { grid-template-columns: 1fr; }
  .aside-col { position: static; }
  .field-row { grid-template-columns: 1fr; }
}
</style>
