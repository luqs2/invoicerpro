<template>
  <teleport to="body">
    <transition name="onb-fade">
      <div v-if="show" class="onb-overlay" @click.self="skip">
        <div class="onb-modal">
          <!-- Progress -->
          <div class="onb-progress">
            <div class="onb-step" :class="{ active: step >= 1, complete: step > 1 }">
              <span v-if="step <= 1">1</span>
              <svg v-else width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7l3 3 5-5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </div>
            <div class="onb-line" :class="{ active: step > 1 }" />
            <div class="onb-step" :class="{ active: step >= 2, complete: step > 2 }">
              <span v-if="step <= 2">2</span>
              <svg v-else width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7l3 3 5-5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </div>
            <div class="onb-line" :class="{ active: step > 2 }" />
            <div class="onb-step" :class="{ active: step >= 3 }">
              <span>3</span>
            </div>
          </div>

          <!-- Step 1: Welcome -->
          <div v-if="step === 1" class="onb-content">
            <div class="onb-icon onb-icon-brand">
              <FileText :size="28" />
            </div>
            <h2 class="onb-title">Welcome to InvoicerPro</h2>
            <p class="onb-desc">Let's get you set up in just a few steps. First, add your business details so they appear on your invoices.</p>
            <div class="onb-form">
              <div class="onb-field">
                <label>Business Name</label>
                <input v-model="profile.name" placeholder="Acme Co." />
              </div>
              <div class="onb-field">
                <label>Email</label>
                <input v-model="profile.email" type="email" placeholder="hello@acme.com" />
              </div>
            </div>
          </div>

          <!-- Step 2: Add client -->
          <div v-if="step === 2" class="onb-content">
            <div class="onb-icon onb-icon-purple">
              <Users :size="28" />
            </div>
            <h2 class="onb-title">Add your first client</h2>
            <p class="onb-desc">Adding clients now makes invoice creation faster later. You can always skip this.</p>
            <div class="onb-form">
              <div class="onb-field">
                <label>Client Name</label>
                <input v-model="client.name" placeholder="Jane Smith" />
              </div>
              <div class="onb-field">
                <label>Email</label>
                <input v-model="client.email" type="email" placeholder="jane@company.com" />
              </div>
            </div>
          </div>

          <!-- Step 3: Ready -->
          <div v-if="step === 3" class="onb-content">
            <div class="onb-icon onb-icon-green">
              <CheckCircle :size="28" />
            </div>
            <h2 class="onb-title">You're all set!</h2>
            <p class="onb-desc">Start creating professional invoices and tracking payments. Here are some tips:</p>
            <ul class="onb-tips">
              <li>Press <kbd>N</kbd> to create a new invoice</li>
              <li>Use Templates to customise your invoice look</li>
              <li>Check the Dashboard for payment tracking</li>
            </ul>
          </div>

          <!-- Actions -->
          <div class="onb-actions">
            <button class="onb-skip" @click="skip">Skip for now</button>
            <button class="onb-next" @click="next" :disabled="step === 1 && !profile.name">
              {{ step === 3 ? 'Get Started' : 'Continue' }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { FileText, Users, CheckCircle } from '@lucide/vue'
import { useAuthStore } from '@/stores/auth'
import { useBusinessProfileStore } from '@/stores/businessProfile'
import { useClientStore } from '@/stores/clients'
import { useToast } from '@/composables/useToast'

const router = useRouter()
const auth = useAuthStore()
const bpStore = useBusinessProfileStore()
const clientStore = useClientStore()
const { showToast } = useToast()

const show = ref(false)
const step = ref(1)

const profile = reactive({ name: '', email: '' })
const client  = reactive({ name: '', email: '' })

onMounted(async () => {
  if (!auth.user) return
  await bpStore.fetch()
  // Only show onboarding if no business profile name set
  if (!bpStore.profile.name) {
    show.value = true
  }
})

async function next() {
  if (step.value === 1) {
    // Save business profile
    if (profile.name) {
      await bpStore.save({ name: profile.name.trim(), email: profile.email.trim() || undefined })
    }
    step.value = 2
  } else if (step.value === 2) {
    // Save client if provided
    if (client.name && client.email) {
      await clientStore.create({ name: client.name.trim(), email: client.email.trim() })
      showToast('Client added!')
    }
    step.value = 3
  } else {
    // Finish
    skip()
  }
}

function skip() {
  show.value = false
  router.push('/app/dashboard')
}
</script>

<style scoped>
.onb-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
  padding: 24px;
}

.onb-modal {
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.25);
  width: 100%;
  max-width: 440px;
  padding: 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

/* Progress */
.onb-progress {
  display: flex;
  align-items: center;
  gap: 0;
  width: 100%;
  max-width: 200px;
}

.onb-step {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #e2e8f0;
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  transition: all 0.2s;
  flex-shrink: 0;
}
.onb-step.active { background: #6366f1; color: #ffffff; }
.onb-step.complete { background: #10b981; color: #ffffff; }

.onb-line {
  flex: 1;
  height: 2px;
  background: #e2e8f0;
  transition: background 0.2s;
}
.onb-line.active { background: #6366f1; }

/* Content */
.onb-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
}

.onb-icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
}
.onb-icon-brand { background: #ede9fe; color: #6366f1; }
.onb-icon-purple { background: #f5f3ff; color: #8b5cf6; }
.onb-icon-green { background: #d1fae5; color: #10b981; }

.onb-title {
  font-size: 20px;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
  letter-spacing: -0.3px;
}

.onb-desc {
  font-size: 14px;
  color: #64748b;
  margin: 0;
  line-height: 1.5;
  max-width: 340px;
}

/* Form */
.onb-form {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 8px;
}

.onb-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: left;
}

.onb-field label {
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.onb-field input {
  height: 40px;
  padding: 0 12px;
  border: 1.5px solid #e2e8f0;
  border-radius: 9px;
  font-size: 14px;
  color: #0f172a;
  background: #f8fafc;
  outline: none;
  font-family: inherit;
  transition: border-color 0.15s;
}
.onb-field input:focus {
  border-color: #6366f1;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}
.onb-field input::placeholder { color: #94a3b8; }

/* Tips */
.onb-tips {
  list-style: none;
  padding: 0;
  margin: 8px 0 0;
  text-align: left;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.onb-tips li {
  font-size: 13px;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 8px;
}

.onb-tips li::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #6366f1;
  flex-shrink: 0;
}

.onb-tips kbd {
  display: inline-block;
  padding: 1px 6px;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  background: #f1f5f9;
  font-size: 11px;
  font-family: inherit;
  font-weight: 700;
  color: #374151;
}

/* Actions */
.onb-actions {
  display: flex;
  gap: 10px;
  width: 100%;
}

.onb-skip {
  flex: 1;
  height: 42px;
  border: none;
  border-radius: 10px;
  background: #f1f5f9;
  color: #64748b;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.12s;
}
.onb-skip:hover { background: #e2e8f0; }

.onb-next {
  flex: 1;
  height: 42px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #ffffff;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: opacity 0.15s;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}
.onb-next:hover:not(:disabled) { opacity: 0.9; }
.onb-next:disabled { opacity: 0.5; cursor: not-allowed; }

/* Transition */
.onb-fade-enter-active,
.onb-fade-leave-active { transition: opacity 0.2s; }
.onb-fade-enter-active .onb-modal,
.onb-fade-leave-active .onb-modal { transition: transform 0.25s, opacity 0.25s; }
.onb-fade-enter-from,
.onb-fade-leave-to { opacity: 0; }
.onb-fade-enter-from .onb-modal { transform: scale(0.95); opacity: 0; }
.onb-fade-leave-to .onb-modal { transform: scale(0.95); opacity: 0; }
</style>
