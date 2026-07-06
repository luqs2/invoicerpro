<template>
  <teleport to="body">
    <transition name="confirm-fade">
      <div
        v-if="open"
        class="send-overlay"
        @click.self="$emit('close')"
      >
        <div
          ref="dialogRef"
          class="send-dialog"
          role="dialog"
          aria-modal="true"
        >
          <div class="send-header">
            <h3 class="send-title">
              Send {{ documentType === 'invoice' ? 'Invoice' : documentType === 'receipt' ? 'Receipt' : 'Purchase Order' }} {{ documentNumber }}
            </h3>
            <button
              class="send-close"
              @click="$emit('close')"
            >
              <X :size="18" />
            </button>
          </div>

          <div class="send-to">
            To: <strong>{{ clientName }}</strong>
          </div>

          <!-- Email Section -->
          <div class="send-section">
            <div class="send-section-header">
              <Mail :size="16" />
              <span>Send via Email</span>
            </div>
            <div
              v-if="clientEmail"
              class="send-section-body"
            >
              <label class="send-label">Email</label>
              <UiInput
                v-model="emailAddress"
                type="email"
                placeholder="client@email.com"
              />
              <UiButton
                variant="primary"
                :loading="sendingEmail"
                :disabled="!emailAddress || sendingEmail"
                class="send-action-btn"
                @click="sendEmail"
              >
                {{ sendingStatus || 'Send Email' }}
              </UiButton>
            </div>
            <div
              v-else
              class="send-section-body"
            >
              <p class="send-warning">
                No email address on file for this client.
              </p>
            </div>
          </div>

          <!-- WhatsApp Section -->
          <div class="send-section">
            <div class="send-section-header">
              <MessageCircle :size="16" />
              <span>Send via WhatsApp</span>
            </div>
            <div
              v-if="clientPhone"
              class="send-section-body"
            >
              <p class="send-phone">
                {{ clientPhone }}
              </p>
              <UiButton
                variant="primary"
                class="send-action-btn"
                @click="openWhatsApp"
              >
                Open WhatsApp
              </UiButton>
            </div>
            <div
              v-else
              class="send-section-body"
            >
              <p class="send-warning">
                No phone number on file for this client.
              </p>
            </div>
          </div>

          <p class="send-note">
            PDF is attached to the email automatically.
          </p>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { X, Mail, MessageCircle } from '@lucide/vue'
import { useEscapeKey, useFocusTrap } from '@/composables/useFocusTrap'
import { useToast } from '@/composables/useToast'
import { usePdf } from '@/composables/usePdf'
import { emailSendService } from '@/services/emailSend'
import { invoiceService } from '@/services/invoices'
import { buildWhatsAppUrl } from '@/utils/whatsapp'
import UiButton from '@/components/ui/Button.vue'
import UiInput from '@/components/ui/Input.vue'

const props = defineProps<{
  open: boolean
  clientName: string
  clientEmail: string
  clientPhone: string
  documentType: 'invoice' | 'receipt' | 'purchase_order'
  documentNumber: string
  amount: string
  currency: string
  dueDate?: string
  paymentDate?: string
  businessName?: string
  businessEmail?: string
  previewElementId: string
  invoiceId?: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'sent', info: { method: 'email' | 'whatsapp' }): void
}>()

const { showToast } = useToast()
const { getPdfBase64 } = usePdf()
const dialogRef = ref<HTMLElement | null>(null)
const emailAddress = ref(props.clientEmail)
const sendingEmail = ref(false)
const sendingStatus = ref('')

useEscapeKey(() => {
  if (props.open) emit('close')
})

useFocusTrap(dialogRef)

watch(() => props.open, async (open) => {
  if (open) {
    emailAddress.value = props.clientEmail
    await nextTick()
  }
})

function buildEmailHtml(): string {
  const docLabel = props.documentType === 'invoice' ? 'Invoice' : props.documentType === 'receipt' ? 'Receipt' : 'Purchase Order'
  let body = `
    <div style="font-family: system-ui, sans-serif, Arial; font-size: 16px; background-color: #fff8f1">
      <div style="max-width: 600px; margin: auto; padding: 16px">
        <p>Hi ${props.clientName},</p>
        <p>
          Please find your <strong>${docLabel}</strong> <strong>${props.documentNumber}</strong> for <strong>${props.amount} ${props.currency}</strong> attached to this email.
        </p>`

  if (props.dueDate) {
    body += `<p><strong>Due date:</strong> ${props.dueDate}</p>`
  }
  if (props.paymentDate) {
    body += `<p><strong>Payment date:</strong> ${props.paymentDate}</p>`
  }

  body += `
        <p>If you have any questions, feel free to reach out.</p>
        <p>Best regards,<br/>${props.businessName ?? ''}</p>
      </div>
    </div>`

  return body
}

async function sendEmail() {
  if (!emailAddress.value || sendingEmail.value) return
  sendingEmail.value = true
  try {
    let pdfBase64: string | undefined
    let pdfFilename: string | undefined

    try {
      sendingStatus.value = 'Generating PDF...'
      pdfBase64 = await getPdfBase64(props.previewElementId)
      pdfFilename = `${props.documentNumber}.pdf`
    } catch (err) {
      console.error('PDF generation failed:', err)
      showToast('PDF generation failed — sending without attachment', 'warning')
    }

    sendingStatus.value = 'Sending email...'
    const docLabel = props.documentType === 'invoice' ? 'Invoice' : props.documentType === 'receipt' ? 'Receipt' : 'Purchase Order'
    const result = await emailSendService.send({
      to: emailAddress.value,
      subject: `${docLabel} ${props.documentNumber} from ${props.businessName ?? ''}`,
      html: buildEmailHtml(),
      pdfBase64,
      pdfFilename,
    })

    if (result.success) {
      showToast('Email sent successfully with PDF attached!')
      emit('sent', { method: 'email' })
    } else {
      showToast(result.error ?? 'Failed to send email', 'danger')
    }
  } catch {
    showToast('Failed to send email', 'danger')
  } finally {
    sendingEmail.value = false
    sendingStatus.value = ''
  }
}

async function openWhatsApp() {
  let invoiceLink = ''
  if (props.invoiceId) {
    try {
      const slug = await invoiceService.getPublicSlug(props.invoiceId)
      if (slug) {
        invoiceLink = `${window.location.origin}/view-invoice/${slug}`
      }
    } catch {
      // slug fetch failed — continue without link
    }
  }

  const url = buildWhatsAppUrl(props.clientPhone, {
    clientName: props.clientName,
    documentType: props.documentType,
    documentNumber: props.documentNumber,
    amount: props.amount,
    currency: props.currency,
    dueDate: props.dueDate,
    paymentDate: props.paymentDate,
    businessName: props.businessName,
    invoiceLink,
  })

  if (!url) {
    showToast('Invalid phone number', 'danger')
    return
  }

  window.open(url, '_blank')
  showToast('WhatsApp opened!')
  emit('sent', { method: 'whatsapp' })
}
</script>

<style scoped>
.send-overlay {
  position: fixed;
  inset: 0;
  background: rgba(17, 20, 19, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 24px;
}

.send-dialog {
  background: #F7F4EC;
  border-radius: 16px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 440px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.send-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.send-title {
  font-size: 16px;
  font-weight: 700;
  color: #1e1b15;
  margin: 0;
}

.send-close {
  background: none;
  border: none;
  cursor: pointer;
  color: #414846;
  padding: 4px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
}
.send-close:hover { background: #EDE8DE; }

.send-to {
  font-size: 14px;
  color: #414846;
}

.send-section {
  border: 1px solid #D6D0C2;
  border-radius: 12px;
  overflow: hidden;
}

.send-section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #EDE8DE;
  font-size: 14px;
  font-weight: 600;
  color: #1e1b15;
}

.send-section-body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.send-label {
  font-size: 13px;
  font-weight: 500;
  color: #414846;
}

.send-action-btn {
  width: 100%;
}

.send-phone {
  font-size: 14px;
  color: #1e1b15;
  margin: 0;
}

.send-warning {
  font-size: 13px;
  color: #9a8c7e;
  margin: 0;
}

.send-note {
  font-size: 12px;
  color: #9a8c7e;
  margin: 0;
  text-align: center;
}

/* Transition */
.confirm-fade-enter-active,
.confirm-fade-leave-active { transition: opacity 0.2s; }
.confirm-fade-enter-active .send-dialog,
.confirm-fade-leave-active .send-dialog { transition: transform 0.2s, opacity 0.2s; }
.confirm-fade-enter-from,
.confirm-fade-leave-to { opacity: 0; }
.confirm-fade-enter-from .send-dialog { transform: scale(0.95); opacity: 0; }
.confirm-fade-leave-to .send-dialog { transform: scale(0.95); opacity: 0; }

.dark .send-dialog { background: #1d201f; }
.dark .send-title { color: #e1e3e1; }
.dark .send-to { color: #c0c8c4; }
.dark .send-to strong { color: #e1e3e1; }
.dark .send-close:hover { background: #404945; }
.dark .send-section { border-color: #404945; }
.dark .send-section-header { background: #111413; color: #e1e3e1; }
.dark .send-phone { color: #e1e3e1; }
.dark .send-warning { color: #7a8280; }
</style>
