<template>
  <div class="page">

    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Templates</h1>
        <p class="page-sub">Customise the look of your invoices</p>
      </div>
      <UiButton @click="save" :loading="saving">Save Changes</UiButton>
    </div>

    <!-- Tabs -->
    <UiTabs v-model="tab" :tabs="[
      { value: 'pick',    label: 'Layouts' },
      { value: 'custom', label: 'Customise' },
      { value: 'preview', label: 'Preview' },
    ]" />

    <!-- Layouts tab -->
    <div v-show="tab === 'pick'" class="tpl-grid">
      <TemplateCard
        v-for="t in templateStore.templates"
        :key="t.id"
        :template="t"
        :selected="templateStore.active?.id === t.id"
        @click="templateStore.setActive(t)"
      />
    </div>

    <!-- Customise tab -->
    <div v-show="tab === 'custom'" class="custom-layout">

      <div class="settings-card">
        <div class="card-header">
          <h2 class="card-title">Colours</h2>
        </div>
        <div class="card-body">
          <div class="color-row">
            <div class="color-field">
              <label>Primary Colour</label>
              <div class="color-input-wrap">
                <div class="color-swatch" :style="{ background: draft.primary_color }" />
                <span class="color-hex">{{ draft.primary_color }}</span>
                <input type="color" v-model="draft.primary_color" class="color-picker" />
              </div>
            </div>
            <div class="color-field">
              <label>Header Background</label>
              <div class="color-input-wrap">
                <div class="color-swatch" :style="{ background: draft.secondary_color }" />
                <span class="color-hex">{{ draft.secondary_color }}</span>
                <input type="color" v-model="draft.secondary_color" class="color-picker" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="settings-card">
        <div class="card-header">
          <h2 class="card-title">Typography</h2>
        </div>
        <div class="card-body">
          <div class="field-row">
            <div class="field">
              <label>Font Family</label>
              <UiSelect
                v-model="draft.font_family"
                :options="fontOptions"
                placeholder="Select font..."
              />
            </div>
            <div class="field">
              <label>Border Radius</label>
              <UiSelect
                v-model="draft.border_radius"
                :options="radiusOptions"
                placeholder="Select radius..."
              />
            </div>
          </div>
        </div>
      </div>

      <div class="settings-card">
        <div class="card-header">
          <h2 class="card-title">Branding</h2>
        </div>
        <div class="card-body">
          <div class="field-row">
            <div class="field">
              <label>Template Name</label>
              <UiInput v-model="draft.name" placeholder="My Template" />
            </div>
          </div>
          <div class="field">
            <label>Footer Text</label>
            <UiTextarea v-model="draft.footer_text" placeholder="Thank you for your business!" :rows="2" />
          </div>
        </div>
      </div>

    </div>

    <!-- Preview tab -->
    <div v-show="tab === 'preview'" class="preview-wrap">
      <InvoicePreview :invoice="sampleInvoice" :template="previewTemplate" />
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useTemplateStore } from '@/stores/templates'
import { useToast } from '@/composables/useToast'
import TemplateCard from '@/components/template/TemplateCard.vue'
import InvoicePreview from '@/components/invoice/InvoicePreview.vue'
import UiButton from '@/components/ui/Button.vue'
import UiTabs from '@/components/ui/Tabs.vue'
import UiSelect from '@/components/ui/Select.vue'
import UiInput from '@/components/ui/Input.vue'
import UiTextarea from '@/components/ui/Textarea.vue'
import type { Invoice } from '@/types'

const templateStore = useTemplateStore()
const { showToast } = useToast()

const tab    = ref('pick')
const saving = ref(false)

const draft = reactive({
  name:            'My Template',
  primary_color:   '#6366f1',
  secondary_color: '#0f172a',
  font_family:     "'Inter', sans-serif",
  border_radius:   '4px',
  footer_text:     'Thank you for your business!',
})

const fontOptions = [
  { value: "'Inter', sans-serif",       label: 'Inter (Modern)' },
  { value: "Georgia, serif",            label: 'Georgia (Classic)' },
  { value: "'DM Mono', monospace",      label: 'DM Mono (Technical)' },
]

const radiusOptions = [
  { value: '0px', label: 'Square' },
  { value: '4px', label: 'Subtle' },
  { value: '8px', label: 'Rounded' },
]

const previewTemplate = computed(() => ({ ...templateStore.active, ...draft } as any))

const sampleInvoice: Partial<Invoice> = {
  invoice_number: 'INV-0001',
  issue_date:     '2026-06-07',
  due_date:       '2026-06-21',
  currency:       'MYR',
  subtotal:       1500,
  tax_rate:       6,
  tax_amount:     90,
  total:          1590,
  notes:          'Thank you!',
  client: {
    id:         'sample',
    user_id:    'sample',
    created_at: '',
    name:       'Sample Client',
    email:      'client@email.com',
    address:    'Kuala Lumpur, Malaysia',
  },
  line_items: [
    { id: '1', description: 'Design Service', quantity: 1, unit_price: 1000, amount: 1000 },
    { id: '2', description: 'Development',    quantity: 1, unit_price: 500,  amount: 500  },
  ],
}

onMounted(async () => {
  await templateStore.fetchAll()
})

watch(() => templateStore.active, (t) => {
  if (t) Object.assign(draft, t)
}, { immediate: true })

async function save() {
  saving.value = true
  try {
    await templateStore.save({ ...templateStore.active, ...draft } as any)
    showToast('Template saved!')
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.page {
  padding: 32px 36px;
  max-width: 1100px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
}
.page-title { font-size: 26px; font-weight: 800; color: #0f172a; margin: 0 0 2px; letter-spacing: -0.5px; }
.page-sub   { font-size: 13px; color: #94a3b8; margin: 0; font-weight: 500; }

/* Layout grid */
.tpl-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
}

.custom-layout {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Settings card (shared with SettingsPage style) */
.settings-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  box-shadow: 0 1px 3px rgba(0,0,0,.05);
  overflow: hidden;
}

.card-header {
  padding: 16px 20px 12px;
  border-bottom: 1px solid #f1f5f9;
}

.card-title {
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
  letter-spacing: -0.1px;
}

.card-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Field layout */
.field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
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

/* Colour pickers */
.color-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.color-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.color-field label {
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.color-input-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 38px;
  padding: 0 12px;
  border: 1.5px solid #e2e8f0;
  border-radius: 9px;
  background: #f8fafc;
  cursor: pointer;
  position: relative;
  transition: border-color .15s;
}

.color-input-wrap:hover { border-color: #c7d2fe; }

.color-swatch {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  border: 1px solid rgba(0,0,0,.1);
  flex-shrink: 0;
}

.color-hex {
  font-size: 13px;
  font-family: 'JetBrains Mono', monospace;
  color: #374151;
  font-weight: 500;
}

.color-picker {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
  width: 100%;
  height: 100%;
  border: none;
  padding: 0;
}

/* Preview */
.preview-wrap {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,.05);
}

@media (max-width: 768px) {
  .page { padding: 20px 16px; }
  .field-row, .color-row { grid-template-columns: 1fr; }
}
</style>