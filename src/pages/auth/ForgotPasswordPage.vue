<template>
  <div class="auth-form">
    <div class="form-header">
      <div class="header-icon">
        <KeyRound :size="20" />
      </div>
      <h2>Reset password</h2>
      <p v-if="!success">
        Enter your email and a new password
      </p>
      <p v-else>
        Your password has been updated
      </p>
    </div>

    <!-- Success state -->
    <div
      v-if="success"
      class="success-state"
    >
      <div class="success-icon">
        <CheckCircle :size="32" />
      </div>
      <p class="success-text">
        Password reset successful
      </p>
      <UiButton
        size="lg"
        class="submit-btn"
        @click="router.replace('/auth/login')"
      >
        Back to Sign In
      </UiButton>
    </div>

    <!-- Form state -->
    <form
      v-else
      novalidate
      @submit.prevent="resetPassword"
    >
      <div class="field-group">
        <div
          class="field"
          :class="{ 'field-error': errors.email }"
        >
          <label for="rp-email">Email</label>
          <div class="input-wrap">
            <Mail
              :size="16"
              class="field-icon"
            />
            <input
              id="rp-email"
              v-model="email"
              type="email"
              placeholder="you@company.com"
              autocomplete="email"
              :disabled="loading"
              @blur="validateEmail"
            >
          </div>
          <p
            v-if="errors.email"
            class="field-error-text"
          >
            {{ errors.email }}
          </p>
        </div>

        <div
          class="field"
          :class="{ 'field-error': errors.newPassword }"
        >
          <label for="rp-password">New Password</label>
          <div class="input-wrap">
            <Lock
              :size="16"
              class="field-icon"
            />
            <input
              id="rp-password"
              v-model="newPassword"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Min. 8 characters"
              autocomplete="new-password"
              :disabled="loading"
              @blur="validatePassword"
            >
            <button
              type="button"
              class="toggle-password"
              :aria-label="showPassword ? 'Hide password' : 'Show password'"
              tabindex="-1"
              @click="showPassword = !showPassword"
            >
              <EyeOff
                v-if="showPassword"
                :size="16"
              />
              <Eye
                v-else
                :size="16"
              />
            </button>
          </div>
          <p
            v-if="errors.newPassword"
            class="field-error-text"
          >
            {{ errors.newPassword }}
          </p>
        </div>

        <div
          class="field"
          :class="{ 'field-error': errors.confirmPassword }"
        >
          <label for="rp-confirm">Confirm Password</label>
          <div class="input-wrap">
            <Lock
              :size="16"
              class="field-icon"
            />
            <input
              id="rp-confirm"
              v-model="confirmPassword"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Re-enter password"
              autocomplete="new-password"
              :disabled="loading"
              @blur="validateConfirm"
            >
          </div>
          <p
            v-if="errors.confirmPassword"
            class="field-error-text"
          >
            {{ errors.confirmPassword }}
          </p>
        </div>
      </div>

      <UiButton
        type="submit"
        size="lg"
        :loading="loading"
        :disabled="!isFormValid"
        class="submit-btn"
      >
        Reset Password
      </UiButton>
    </form>

    <p
      v-if="!success"
      class="switch-link"
    >
      Remember your password?
      <router-link to="/auth/login">
        Sign in
      </router-link>
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import { KeyRound, Mail, Lock, Eye, EyeOff, CheckCircle } from '@lucide/vue'
import UiButton from '@/components/ui/Button.vue'

const router = useRouter()
const auth = useAuthStore()
const { showToast } = useToast()

const email           = ref('')
const newPassword     = ref('')
const confirmPassword = ref('')
const loading         = ref(false)
const showPassword    = ref(false)
const success         = ref(false)

const errors = ref<{ email?: string; newPassword?: string; confirmPassword?: string }>({})

const isFormValid = computed(() =>
  email.value.trim().length > 0 &&
  newPassword.value.length >= 8 &&
  confirmPassword.value.length > 0
)

function validateEmail() {
  if (!email.value.trim()) {
    errors.value.email = 'Email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    errors.value.email = 'Please enter a valid email'
  } else {
    delete errors.value.email
  }
}

function validatePassword() {
  if (!newPassword.value) {
    errors.value.newPassword = 'Password is required'
  } else if (newPassword.value.length < 8) {
    errors.value.newPassword = 'Password must be at least 8 characters'
  } else {
    delete errors.value.newPassword
  }
  // Re-validate confirm if it's been touched
  if (confirmPassword.value) validateConfirm()
}

function validateConfirm() {
  if (!confirmPassword.value) {
    errors.value.confirmPassword = 'Please confirm your password'
  } else if (confirmPassword.value !== newPassword.value) {
    errors.value.confirmPassword = 'Passwords do not match'
  } else {
    delete errors.value.confirmPassword
  }
}

async function resetPassword() {
  validateEmail()
  validatePassword()
  validateConfirm()
  if (Object.keys(errors.value).length > 0) return

  try {
    loading.value = true
    await auth.resetPassword(email.value, newPassword.value)
    success.value = true
  } catch (e: any) {
    showToast(e.message ?? 'Failed to reset password', 'danger')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-form {
  padding: 32px 28px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-header {
  text-align: center;
}

.header-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 16px;
  background: linear-gradient(135deg, #fef3c7, #fee2e2);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #d97706;
}

.form-header h2 {
  font-size: 22px;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 6px;
  letter-spacing: -0.4px;
}

.form-header p {
  font-size: 14px;
  color: #64748b;
  margin: 0;
}

form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field label {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  letter-spacing: 0.1px;
}

.input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.field-icon {
  position: absolute;
  left: 14px;
  color: #94a3b8;
  pointer-events: none;
  transition: color .15s;
}

.input-wrap input {
  width: 100%;
  height: 46px;
  padding: 0 14px 0 42px;
  border: 1.5px solid #e2e8f0;
  border-radius: 11px;
  font-size: 15px;
  color: #0f172a;
  background: #f8fafc;
  outline: none;
  transition: border-color .15s, box-shadow .15s, background .15s;
  font-family: inherit;
}

.input-wrap input:hover:not(:disabled) { border-color: #c7d2fe; }

.input-wrap input:focus {
  border-color: #6366f1;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(99,102,241,.12);
}

.input-wrap input::placeholder { color: #94a3b8; }
.input-wrap input:disabled { opacity: .55; cursor: not-allowed; }

.toggle-password {
  position: absolute;
  right: 12px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: none;
  cursor: pointer;
  color: #94a3b8;
  border-radius: 6px;
  transition: color .12s, background .12s;
}
.toggle-password:hover { color: #64748b; background: #f1f5f9; }

/* Error state */
.field-error .input-wrap input {
  border-color: #ef4444;
}
.field-error .input-wrap input:focus {
  box-shadow: 0 0 0 3px rgba(239,68,68,.12);
}
.field-error .field-icon { color: #ef4444; }

.field-error-text {
  font-size: 12px;
  color: #ef4444;
  margin: 0;
  font-weight: 500;
}

.submit-btn {
  width: 100%;
  margin-top: 4px;
}

.switch-link {
  text-align: center;
  font-size: 14px;
  color: #64748b;
  margin: 0;
}

.switch-link a {
  color: #6366f1;
  font-weight: 600;
  text-decoration: none;
  transition: color .12s;
}
.switch-link a:hover { color: #4f46e5; text-decoration: underline; }

/* Success state */
.success-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 20px 0;
}

.success-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #d1fae5;
  color: #059669;
  display: flex;
  align-items: center;
  justify-content: center;
}

.success-text {
  font-size: 16px;
  font-weight: 600;
  color: #065f46;
  margin: 0;
}

@media (max-width: 480px) {
  .auth-form { padding: 24px 20px; }
}
</style>
