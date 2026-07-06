<template>
  <div class="public-page">
    <!-- Header -->
    <header class="public-header">
      <div class="header-inner">
        <div class="header-brand">
          <FileText :size="20" />
          <span class="header-title">InvoicerPro</span>
        </div>
      </div>
    </header>

    <!-- Content -->
    <main class="public-main">
      <div
        v-if="loading"
        class="status-box"
      >
        <div class="spinner" />
        <p>Loading document...</p>
      </div>

      <div
        v-else-if="error"
        class="status-box"
      >
        <AlertCircle
          :size="48"
          class="status-icon error"
        />
        <h2>Document not found</h2>
        <p>{{ error }}</p>
      </div>

      <template v-else-if="docType">
        <div class="invoice-wrapper">
          <InvoicePreview
            v-if="docType === 'invoice'"
            id="public-doc-preview"
            :invoice="docData"
            :template="template"
          />
          <PurchaseOrderPreview
            v-else-if="docType === 'purchase_order'"
            id="public-doc-preview"
            :purchase-order="docData"
            :template="template"
          />
          <ReceiptPreview
            v-else-if="docType === 'receipt'"
            id="public-doc-preview"
            :receipt="docData"
            :template="template"
          />
        </div>

        <div class="actions">
          <button
            class="download-btn"
            @click="downloadPdf"
          >
            <Download :size="18" />
            Download PDF
          </button>
        </div>
      </template>
    </main>

    <!-- Footer -->
    <footer class="public-footer">
      <p>Powered by <strong>InvoicerPro</strong></p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, defineAsyncComponent } from 'vue'
import { useRoute } from 'vue-router'
import { Download, AlertCircle, FileText } from '@lucide/vue'
import { supabase } from '@/services/supabase'
import { usePdf } from '@/composables/usePdf'
import { useBusinessProfileStore } from '@/stores/businessProfile'
import type { InvoiceTemplate } from '@/types'

const InvoicePreview = defineAsyncComponent(() => import('@/components/invoice/InvoicePreview.vue'))
const PurchaseOrderPreview = defineAsyncComponent(() => import('@/components/purchase-order/PurchaseOrderPreview.vue'))
const ReceiptPreview = defineAsyncComponent(() => import('@/components/receipt/ReceiptPreview.vue'))

const route = useRoute()
const { exportToPdf } = usePdf()
const bpStore = useBusinessProfileStore()

const loading = ref(true)
const error = ref('')
const docType = ref<'invoice' | 'purchase_order' | 'receipt' | null>(null)
const docData = ref<any>(null)
const template = ref<InvoiceTemplate | null>(null)

onMounted(async () => {
  const slug = route.params.slug as string
  if (!slug) {
    error.value = 'Invalid link.'
    loading.value = false
    return
  }

  // Try invoices first
  const { data: inv } = await supabase
    .from('invoices')
    .select('*, client:clients(name, email, phone, address, company)')
    .eq('public_slug', slug)
    .single()

  if (inv) {
    docType.value = 'invoice'
    docData.value = inv
    await loadTemplate(inv.user_id)
    loading.value = false
    return
  }

  // Try purchase orders
  const { data: po } = await supabase
    .from('purchase_orders')
    .select('*, client:clients(name, email, phone, address, company)')
    .eq('public_slug', slug)
    .single()

  if (po) {
    docType.value = 'purchase_order'
    docData.value = po
    await loadTemplate(po.user_id)
    loading.value = false
    return
  }

  // Try receipts
  const { data: rc } = await supabase
    .from('receipts')
    .select('*, client:clients(name, email, phone, address, company)')
    .eq('public_slug', slug)
    .single()

  if (rc) {
    docType.value = 'receipt'
    docData.value = rc
    await loadTemplate(rc.user_id)
    loading.value = false
    return
  }

  error.value = 'This link is invalid or has expired.'
  loading.value = false
})

async function loadTemplate(userId: string) {
  const { data: bp } = await supabase
    .from('business_profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (bp) {
    bpStore.profile = bp as any
    const tid = (bp as any).active_template_id
    if (tid) {
      const { data: tmpl } = await supabase
        .from('invoice_templates')
        .select('*')
        .eq('id', tid)
        .single()
      template.value = tmpl as InvoiceTemplate | null
    }
  }
}

async function downloadPdf() {
  const num = docData.value?.invoice_number
    || docData.value?.po_number
    || docData.value?.receipt_number
    || 'document'
  await exportToPdf('public-doc-preview', num)
}
</script>

<style scoped>
.public-page {
  min-height: 100vh;
  height: auto;
  background: #f5f3ee;
  display: flex;
  flex-direction: column;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  overflow-y: auto;
}

.public-header {
  background: #1f3a34;
  color: white;
  padding: 14px 24px;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-inner {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-brand {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-title {
  font-family: 'Merriweather', Georgia, serif;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.public-main {
  flex: 1;
  padding: 40px 24px 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.public-footer {
  background: #1e1b15;
  color: #9a8c7e;
  padding: 20px 24px;
  text-align: center;
  font-size: 13px;
}

.public-footer p {
  margin: 0;
}

.public-footer strong {
  color: #e1e3e1;
}

.status-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 120px 24px;
  text-align: center;
}

.status-icon.error { color: #dc2626; }

.status-box h2 {
  font-family: 'Merriweather', Georgia, serif;
  font-size: 22px;
  font-weight: 700;
  color: #1e1b15;
  margin: 0;
}

.status-box p {
  font-size: 14px;
  color: #9a8c7e;
  margin: 0;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #D6D0C2;
  border-top-color: #1f3a34;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.invoice-wrapper {
  width: 100%;
  max-width: 800px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  border: 1px solid #D6D0C2;
  overflow: visible;
}

.actions {
  margin-top: 32px;
  padding-bottom: 40px;
}

.download-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: #1f3a34;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(8, 36, 31, 0.2);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.download-btn:hover {
  background: #2a4d45;
  box-shadow: 0 4px 12px rgba(8, 36, 31, 0.25);
  transform: translateY(-1px);
}

@media (max-width: 640px) {
  .public-main { padding: 16px 12px 60px; }
  .invoice-wrapper { border-radius: 8px; }
}
</style>

<style>
html, body, #app {
  height: auto !important;
  overflow-y: auto !important;
  overflow-x: hidden !important;
}
</style>
