<template>
  <div class="page">

    <div class="page-header">
      <div>
        <h1 class="page-title">Templates</h1>
        <p class="page-sub">Customise the look of your invoices</p>
      </div>
      <UiButton @click="save" :loading="saving">Save Changes</UiButton>
    </div>

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

      <!-- Header Layout -->
      <div class="settings-card">
        <div class="card-header">
          <h2 class="card-title">Header Layout</h2>
          <p class="card-desc">Choose how the top of your invoice looks.</p>
        </div>
        <div class="card-body">
          <div class="header-layout-grid">
            <button
              v-for="layout in headerLayouts"
              :key="layout.value"
              class="header-layout-card"
              :class="{ 'header-layout-card--active': draft.header_layout === layout.value }"
              @click="draft.header_layout = layout.value"
            >
              <div class="header-layout-preview">
                <!-- Classic -->
                <svg v-if="layout.value === 'classic'" viewBox="0 0 120 52" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="8" y="10" width="16" height="16" rx="3" :fill="draft.primary_color" opacity="0.85"/>
                  <rect x="8" y="30" width="28" height="4" rx="1.5" fill="#1e293b" opacity="0.7"/>
                  <rect x="8" y="37" width="20" height="2.5" rx="1" fill="#94a3b8" opacity="0.5"/>
                  <rect x="80" y="10" width="32" height="7" rx="2" :fill="draft.primary_color"/>
                  <rect x="86" y="22" width="26" height="5" rx="1.5" fill="#1e293b" opacity="0.5"/>
                  <rect x="88" y="30" width="22" height="2.5" rx="1" fill="#94a3b8" opacity="0.4"/>
                  <rect x="8" y="44" width="104" height="1.5" rx="0.75" :fill="draft.primary_color"/>
                </svg>
                <!-- Inline -->
                <svg v-else-if="layout.value === 'inline'" viewBox="0 0 120 52" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="8" y="16" width="20" height="20" rx="3" :fill="draft.primary_color" opacity="0.85"/>
                  <rect x="32" y="20" width="30" height="5" rx="1.5" fill="#1e293b" opacity="0.7"/>
                  <rect x="32" y="28" width="20" height="3" rx="1" fill="#94a3b8" opacity="0.4"/>
                  <rect x="78" y="14" width="34" height="7" rx="2" :fill="draft.primary_color"/>
                  <rect x="82" y="25" width="28" height="4" rx="1.5" fill="#1e293b" opacity="0.4"/>
                  <rect x="84" y="33" width="24" height="2.5" rx="1" fill="#94a3b8" opacity="0.35"/>
                  <rect x="8" y="44" width="104" height="1.5" rx="0.75" :fill="draft.primary_color"/>
                </svg>
                <!-- Centered -->
                <svg v-else-if="layout.value === 'centered'" viewBox="0 0 120 52" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="52" y="6" width="16" height="16" rx="3" :fill="draft.primary_color" opacity="0.85"/>
                  <rect x="40" y="26" width="40" height="4" rx="1.5" fill="#1e293b" opacity="0.7"/>
                  <rect x="44" y="33" width="32" height="7" rx="2" :fill="draft.primary_color" opacity="0.9"/>
                  <rect x="48" y="43" width="24" height="2.5" rx="1" fill="#94a3b8" opacity="0.4"/>
                </svg>
                <!-- Minimal -->
                <svg v-else-if="layout.value === 'minimal'" viewBox="0 0 120 52" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="8" y="14" width="36" height="5" rx="1.5" fill="#1e293b" opacity="0.8"/>
                  <rect x="8" y="23" width="22" height="2.5" rx="1" fill="#94a3b8" opacity="0.45"/>
                  <rect x="80" y="13" width="28" height="5" rx="1" :fill="draft.primary_color" opacity="0.7"/>
                  <rect x="82" y="23" width="24" height="2.5" rx="1" fill="#94a3b8" opacity="0.4"/>
                  <rect x="8" y="33" width="104" height="1" rx="0.5" :fill="draft.primary_color" opacity="0.4"/>
                </svg>
                <!-- Bold -->
                <svg v-else-if="layout.value === 'bold'" viewBox="0 0 120 52" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="0" y="0" width="120" height="36" rx="4" :fill="draft.secondary_color"/>
                  <rect x="8" y="8" width="20" height="20" rx="3" :fill="draft.primary_color" opacity="0.9"/>
                  <rect x="32" y="12" width="26" height="5" rx="1.5" fill="white" opacity="0.8"/>
                  <rect x="32" y="21" width="18" height="3" rx="1" fill="white" opacity="0.4"/>
                  <rect x="78" y="8" width="34" height="8" rx="2" :fill="draft.primary_color" opacity="0.85"/>
                  <rect x="82" y="20" width="28" height="4" rx="1.5" fill="white" opacity="0.5"/>
                  <rect x="84" y="28" width="24" height="2.5" rx="1" fill="white" opacity="0.3"/>
                </svg>
                <!-- Split -->
                <svg v-else-if="layout.value === 'split'" viewBox="0 0 120 52" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="0" y="0" width="5" height="52" rx="2" :fill="draft.primary_color"/>
                  <rect x="12" y="16" width="18" height="18" rx="3" :fill="draft.primary_color" opacity="0.2"/>
                  <rect x="12" y="17" width="18" height="18" rx="3" :fill="draft.primary_color" opacity="0.6"/>
                  <rect x="34" y="20" width="26" height="5" rx="1.5" fill="#1e293b" opacity="0.7"/>
                  <rect x="34" y="28" width="18" height="3" rx="1" fill="#94a3b8" opacity="0.4"/>
                  <rect x="80" y="14" width="32" height="7" rx="2" :fill="draft.secondary_color"/>
                  <rect x="83" y="25" width="27" height="4" rx="1.5" fill="#1e293b" opacity="0.4"/>
                  <rect x="85" y="33" width="23" height="2.5" rx="1" fill="#94a3b8" opacity="0.35"/>
                  <rect x="8" y="48" width="104" height="1" rx="0.5" :fill="draft.secondary_color" opacity="0.15"/>
                </svg>
              </div>
              <div class="header-layout-label">{{ layout.label }}</div>
              <div class="header-layout-desc">{{ layout.desc }}</div>
              <div v-if="draft.header_layout === layout.value" class="header-layout-check">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="7" r="7" fill="#6366f1"/>
                  <path d="M4 7l2 2 4-4" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- Colours -->
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

      <!-- Typography -->
      <div class="settings-card">
        <div class="card-header">
          <h2 class="card-title">Typography</h2>
        </div>
        <div class="card-body">
          <div class="field-row">
            <div class="field">
              <label>Font Family</label>
              <UiSelect v-model="draft.font_family" :options="fontOptions" placeholder="Select font..." />
            </div>
            <div class="field">
              <label>Border Radius</label>
              <UiSelect v-model="draft.border_radius" :options="radiusOptions" placeholder="Select radius..." />
            </div>
          </div>
          <div class="field-row">
            <div class="field">
              <label>Company Name Size</label>
              <div class="font-size-wrap">
                <input
                  type="range"
                  class="font-size-slider"
                  v-model.number="draft.company_font_size"
                  min="10" max="28" step="1"
                />
                <span class="font-size-value">{{ draft.company_font_size }}px</span>
              </div>
              <div class="font-size-preview" :style="{ fontSize: draft.company_font_size + 'px', fontFamily: draft.font_family }">
                Your Business Name
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Branding -->
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

const templateStore = useTemplateStore()
const { showToast } = useToast()

const tab    = ref('pick')
const saving = ref(false)

const draft = reactive({
  name:              'My Template',
  primary_color:     '#6366f1',
  secondary_color:   '#0f172a',
  font_family:       "'Inter', sans-serif",
  border_radius:     '4px',
  footer_text:       'Thank you for your business!',
  header_layout:     'classic',
  company_font_size: 14,
})

const headerLayouts = [
  { value: 'classic',  label: 'Classic',  desc: 'Logo stacked, info right' },
  { value: 'inline',   label: 'Inline',   desc: 'Logo + name side by side' },
  { value: 'centered', label: 'Centered', desc: 'Everything centered' },
  { value: 'minimal',  label: 'Minimal',  desc: 'Text only, clean rule' },
  { value: 'bold',     label: 'Bold',     desc: 'Full-width colour banner' },
  { value: 'split',    label: 'Split',    desc: 'Accent sidebar strip' },
]

const fontOptions = [
  { value: "'Inter', sans-serif",                label: 'Inter — Modern' },
  { value: "'DM Sans', sans-serif",              label: 'DM Sans — Friendly' },
  { value: "'Outfit', sans-serif",               label: 'Outfit — Clean' },
  { value: "'Manrope', sans-serif",              label: 'Manrope — Geometric' },
  { value: "Georgia, serif",                     label: 'Georgia — Classic serif' },
  { value: "'Playfair Display', serif",          label: 'Playfair Display — Elegant' },
  { value: "'Lora', serif",                      label: 'Lora — Literary' },
  { value: "'DM Mono', monospace",               label: 'DM Mono — Technical' },
  { value: "'Syne', sans-serif",                 label: 'Syne — Editorial' },
  { value: "'Space Grotesk', sans-serif",        label: 'Space Grotesk — Futuristic' },
]

const radiusOptions = [
  { value: '0px',  label: 'Square' },
  { value: '4px',  label: 'Subtle' },
  { value: '8px',  label: 'Rounded' },
  { value: '12px', label: 'Soft' },
]

const previewTemplate = computed(() => ({ ...templateStore.active, ...draft } as any))

const sampleInvoice = {
  invoice_number: 'INV-0001',
  issue_date:     '2026-06-07',
  due_date:       '2026-06-21',
  currency:       'MYR',
  subtotal:       1500,
  tax_rate:       6,
  tax_amount:     90,
  total:          1590,
  notes:          'Thank you!',
  client: { name: 'Sample Client', email: 'client@email.com', address: 'Kuala Lumpur, Malaysia' },
  line_items: [
    { id: '1', description: 'Design Service', quantity: 1, unit_price: 1000, amount: 1000 },
    { id: '2', description: 'Development',    quantity: 1, unit_price: 500,  amount: 500  },
  ],
}

onMounted(async () => {
  await templateStore.fetchAll()
})

watch(() => templateStore.active, (t) => {
  if (t) Object.assign(draft, { company_font_size: 14, ...t })
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

.page-header { display: flex; align-items: flex-end; justify-content: space-between; }
.page-title  { font-size: 26px; font-weight: 800; color: #0f172a; margin: 0 0 2px; letter-spacing: -0.5px; }
.page-sub    { font-size: 13px; color: #94a3b8; margin: 0; font-weight: 500; }

.tpl-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
}

.custom-layout { display: flex; flex-direction: column; gap: 16px; }

.settings-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  box-shadow: 0 1px 3px rgba(0,0,0,.05);
  overflow: hidden;
}

.card-header { padding: 16px 20px 12px; border-bottom: 1px solid #f1f5f9; }
.card-title  { font-size: 14px; font-weight: 700; color: #0f172a; margin: 0 0 2px; }
.card-desc   { font-size: 12px; color: #94a3b8; margin: 0; }
.card-body   { padding: 20px; display: flex; flex-direction: column; gap: 16px; }

/* Header layout picker — 3 per row to fit 6 */
.header-layout-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.header-layout-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  background: #f8fafc;
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  transition: border-color .15s, background .15s, box-shadow .15s;
}

.header-layout-card:hover {
  border-color: #c7d2fe;
  background: #fafaff;
  box-shadow: 0 2px 8px rgba(99,102,241,.08);
}

.header-layout-card--active {
  border-color: #6366f1;
  background: #f5f3ff;
  box-shadow: 0 0 0 3px rgba(99,102,241,.1);
}

.header-layout-preview {
  width: 100%;
  aspect-ratio: 120 / 52;
  border-radius: 6px;
  overflow: hidden;
  background: #fff;
  border: 1px solid #e2e8f0;
}

.header-layout-preview svg { width: 100%; height: 100%; }

.header-layout-label { font-size: 13px; font-weight: 700; color: #0f172a; }
.header-layout-desc  { font-size: 11px; color: #94a3b8; line-height: 1.4; }

.header-layout-check { position: absolute; top: 10px; right: 10px; }

/* Fields */
.field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.field     { display: flex; flex-direction: column; gap: 6px; }

.field label {
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

/* Font size slider */
.font-size-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
}

.font-size-slider {
  flex: 1;
  height: 4px;
  appearance: none;
  background: #e2e8f0;
  border-radius: 2px;
  outline: none;
  cursor: pointer;
}

.font-size-slider::-webkit-slider-thumb {
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #6366f1;
  cursor: pointer;
  box-shadow: 0 1px 4px rgba(99,102,241,.4);
}

.font-size-slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #6366f1;
  cursor: pointer;
  border: none;
}

.font-size-value {
  font-size: 12px;
  font-weight: 700;
  color: #6366f1;
  min-width: 32px;
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.font-size-preview {
  margin-top: 4px;
  padding: 10px 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-weight: 700;
  color: #0f172a;
  transition: font-size .1s;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Colours */
.color-row   { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.color-field { display: flex; flex-direction: column; gap: 8px; }

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
  width: 22px; height: 22px;
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
  position: absolute; inset: 0;
  opacity: 0; cursor: pointer;
  width: 100%; height: 100%;
  border: none; padding: 0;
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
  .header-layout-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>