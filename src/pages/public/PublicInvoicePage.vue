<template>
  <div class="public-page">
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
        <component
          :is="previewComponent"
          :id="previewId"
          v-bind="previewProps"
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, defineAsyncComponent, shallowRef } from 'vue'
import { useRoute } from 'vue-router'
import { Download, AlertCircle } from '@lucide/vue'
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
const docData = shallowRef<any>(null)
const template = ref<InvoiceTemplate | null>(null)
const previewId = ref('public-doc-preview')

const previewComponent = computed(() => {
  if (docType.value === 'invoice') return InvoicePreview
  if (docType.value === 'purchase_order') return PurchaseOrderPreview
  if (docType.value === 'receipt') return ReceiptPreview
  return null
})

const previewProps = computed(() => {
  if (docType.value === 'invoice') {
    return { invoice: docData.value, template: template.value }
  }
  if (docType.value === 'purchase_order') {
    return { purchaseOrder: docData.value, template: template.value }
  }
  if (docType.value === 'receipt') {
    return { receipt: docData.value, template: template.value }
  }
  return {}
})

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
  await exportToPdf(previewId.value, num)
}
</script>

<style scoped>
.public-page {
  min-height: 100vh;
  background: #f5f3ee;
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.status-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 80px 24px;
  text-align: center;
}

.status-icon.error { color: #dc2626; }

.status-box h2 {
  font-size: 20px;
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
  border-top-color: #1e1b15;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.invoice-wrapper {
  width: 100%;
  max-width: 800px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.actions {
  margin-top: 24px;
}

.download-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: #1e1b15;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.2s;
}

.download-btn:hover { background: #2d2a23; }

@media (max-width: 640px) {
  .public-page { padding: 12px; }
  .invoice-wrapper { border-radius: 8px; }
}
</style>
