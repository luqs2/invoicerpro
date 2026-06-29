<template>
  <div class="auth-form">
    <div class="form-header">
      <div class="header-icon">
        <LogIn :size="20" />
      </div>
      <h2>Welcome back</h2>
      <p>Sign in to your account</p>
    </div>

    <form
      novalidate
      @submit.prevent="login"
    >
      <div class="field-group">
        <div
          class="field"
          :class="{ 'field-error': errors.email }"
        >
          <label for="login-email">Email</label>
          <div class="input-wrap">
            <Mail
              :size="16"
              class="field-icon"
            />
            <input
              id="login-email"
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
          :class="{ 'field-error': errors.password }"
        >
          <div class="label-row">
            <label for="login-password">Password</label>
            <button
              type="button"
              class="forgot-link"
              @click="showForgotHint"
            >
              Forgot password?
            </button>
          </div>
          <div class="input-wrap">
            <Lock
              :size="16"
              class="field-icon"
            />
            <input
              id="login-password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Enter your password"
              autocomplete="current-password"
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
            v-if="errors.password"
            class="field-error-text"
          >
            {{ errors.password }}
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
        Sign In
      </UiButton>
    </form>

    <div class="divider">
      <span>or</span>
    </div>

    <p class="switch-link">
      Don't have an account?
      <router-link to="/auth/register">
        Create one free
      </router-link>
    </p>

    <div class="demo-hint">
      <Zap :size="12" />
      <span>Demo: <strong>demo@invoicerpro.com</strong> / <strong>password123</strong></span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import { LogIn, Mail, Lock, Eye, EyeOff, Zap } from '@lucide/vue'
import UiButton from '@/components/ui/Button.vue'

const router = useRouter()
const auth = useAuthStore()
const { showToast } = useToast()

const email       = ref('')
const password    = ref('')
const loading     = ref(false)
const showPassword = ref(false)

const errors = ref<{ email?: string; password?: string }>({})

const isFormValid = computed(() =>
  email.value.trim().length > 0 && password.value.length > 0
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
  if (!password.value) {
    errors.value.password = 'Password is required'
  } else if (password.value.length < 6) {
    errors.value.password = 'Password must be at least 6 characters'
  } else {
    delete errors.value.password
  }
}

function showForgotHint() {
  router.push('/auth/forgot-password')
}

async function login() {
  validateEmail()
  validatePassword()
  if (Object.keys(errors.value).length > 0) return

  try {
    loading.value = true
    await auth.login(email.value, password.value)
    router.replace('/app/dashboard')
  } catch (e: any) {
    const msg = e.message ?? 'Login failed'
    if (msg.toLowerCase().includes('invalid') || msg.toLowerCase().includes('credentials')) {
      errors.value.email = ' '
      errors.value.password = 'Invalid email or password'
    }
    showToast(msg, 'danger')
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
  background: linear-gradient(135deg, #ede9fe, #dbeafe);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6366f1;
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

.label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.field label,
.label-row > label {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  letter-spacing: 0.1px;
}

.forgot-link {
  font-size: 12px;
  font-weight: 600;
  color: #6366f1;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  font-family: inherit;
  transition: color .12s;
}
.forgot-link:hover { color: #4f46e5; text-decoration: underline; }

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

.input-wrap input:focus + .field-icon,
.input-wrap input:focus ~ .field-icon { color: #6366f1; }

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

.divider {
  display: flex;
  align-items: center;
  gap: 16px;
  color: #cbd5e1;
  font-size: 12px;
  font-weight: 500;
}
.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #e2e8f0;
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

.demo-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 11px;
  color: #94a3b8;
  padding: 10px 14px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  text-align: center;
}
.demo-hint strong { color: #64748b; font-weight: 600; }

@media (max-width: 480px) {
  .auth-form { padding: 24px 20px; }
}
</style>
