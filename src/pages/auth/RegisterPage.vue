<template>
  <div class="auth-form">
    <div class="form-header">
      <div class="header-icon">
        <UserPlus :size="20" />
      </div>
      <h2>Create account</h2>
      <p>Start invoicing professionally today</p>
    </div>

    <form @submit.prevent="register" novalidate>
      <div class="field-group">
        <div class="field" :class="{ 'field-error': errors.fullName }">
          <label for="reg-name">Full Name</label>
          <div class="input-wrap">
            <User :size="16" class="field-icon" />
            <input
              id="reg-name"
              v-model="fullName"
              placeholder="Jane Smith"
              autocomplete="name"
              :disabled="loading"
              @blur="validateName"
            />
          </div>
          <p class="field-error-text" v-if="errors.fullName">{{ errors.fullName }}</p>
        </div>

        <div class="field" :class="{ 'field-error': errors.email }">
          <label for="reg-email">Email</label>
          <div class="input-wrap">
            <Mail :size="16" class="field-icon" />
            <input
              id="reg-email"
              v-model="email"
              type="email"
              placeholder="you@company.com"
              autocomplete="email"
              :disabled="loading"
              @blur="validateEmail"
            />
          </div>
          <p class="field-error-text" v-if="errors.email">{{ errors.email }}</p>
        </div>

        <div class="field" :class="{ 'field-error': errors.password }">
          <label for="reg-password">Password</label>
          <div class="input-wrap">
            <Lock :size="16" class="field-icon" />
            <input
              id="reg-password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Min. 8 characters"
              autocomplete="new-password"
              :disabled="loading"
              @blur="validatePassword"
            />
            <button
              type="button"
              class="toggle-password"
              @click="showPassword = !showPassword"
              :aria-label="showPassword ? 'Hide password' : 'Show password'"
              tabindex="-1"
            >
              <EyeOff v-if="showPassword" :size="16" />
              <Eye v-else :size="16" />
            </button>
          </div>
          <p class="field-error-text" v-if="errors.password">{{ errors.password }}</p>
          <div class="password-strength" v-if="password.length > 0">
            <div class="strength-bar">
              <div class="strength-fill" :style="{ width: passwordStrength.percent + '%' }" :class="passwordStrength.class" />
            </div>
            <span class="strength-text" :class="passwordStrength.class">{{ passwordStrength.label }}</span>
          </div>
        </div>
      </div>

      <UiButton
        type="submit"
        size="lg"
        :loading="loading"
        :disabled="!isFormValid"
        class="submit-btn"
      >
        Create Account
      </UiButton>
    </form>

    <p class="switch-link">
      Already have an account?
      <router-link to="/auth/login">Sign in</router-link>
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import { UserPlus, User, Mail, Lock, Eye, EyeOff } from '@lucide/vue'
import UiButton from '@/components/ui/Button.vue'

const router   = useRouter()
const auth     = useAuthStore()
const { showToast } = useToast()

const fullName    = ref('')
const email       = ref('')
const password    = ref('')
const loading     = ref(false)
const showPassword = ref(false)

const errors = ref<{ fullName?: string; email?: string; password?: string }>({})

const isFormValid = computed(() =>
  fullName.value.trim().length > 0 &&
  email.value.trim().length > 0 &&
  password.value.length >= 8
)

const passwordStrength = computed(() => {
  const p = password.value
  let score = 0
  if (p.length >= 8) score++
  if (p.length >= 12) score++
  if (/[A-Z]/.test(p)) score++
  if (/[0-9]/.test(p)) score++
  if (/[^A-Za-z0-9]/.test(p)) score++

  if (score <= 1) return { percent: 20, label: 'Weak', class: 'strength-weak' }
  if (score <= 2) return { percent: 40, label: 'Fair', class: 'strength-fair' }
  if (score <= 3) return { percent: 60, label: 'Good', class: 'strength-good' }
  if (score <= 4) return { percent: 80, label: 'Strong', class: 'strength-strong' }
  return { percent: 100, label: 'Very strong', class: 'strength-very-strong' }
})

function validateName() {
  if (!fullName.value.trim()) {
    errors.value.fullName = 'Name is required'
  } else if (fullName.value.trim().length < 2) {
    errors.value.fullName = 'Name must be at least 2 characters'
  } else {
    delete errors.value.fullName
  }
}

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
  } else if (password.value.length < 8) {
    errors.value.password = 'Password must be at least 8 characters'
  } else {
    delete errors.value.password
  }
}

async function register() {
  validateName()
  validateEmail()
  validatePassword()
  if (Object.keys(errors.value).length > 0) return

  try {
    loading.value = true
    await auth.register(email.value, password.value, fullName.value)
    router.replace('/app/dashboard')
  } catch (e: any) {
    showToast(e.message ?? 'Registration failed', 'danger')
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
  background: linear-gradient(135deg, #d1fae5, #dbeafe);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #059669;
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

/* Password strength */
.password-strength {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 2px;
}

.strength-bar {
  flex: 1;
  height: 4px;
  background: #e2e8f0;
  border-radius: 2px;
  overflow: hidden;
}

.strength-fill {
  height: 100%;
  border-radius: 2px;
  transition: width .3s ease, background .3s ease;
}
.strength-weak         { background: #ef4444; }
.strength-fair         { background: #f59e0b; }
.strength-good         { background: #3b82f6; }
.strength-strong       { background: #10b981; }
.strength-very-strong  { background: #059669; }

.strength-text {
  font-size: 11px;
  font-weight: 600;
  min-width: 70px;
  text-align: right;
}
.strength-text.strength-weak         { color: #ef4444; }
.strength-text.strength-fair         { color: #f59e0b; }
.strength-text.strength-good         { color: #3b82f6; }
.strength-text.strength-strong       { color: #10b981; }
.strength-text.strength-very-strong  { color: #059669; }

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

@media (max-width: 480px) {
  .auth-form { padding: 24px 20px; }
}
</style>
