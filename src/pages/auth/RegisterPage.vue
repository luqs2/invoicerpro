<template>
  <div class="auth-form">
    <div class="form-header">
      <h2>Create account</h2>
      <p>Start invoicing professionally today</p>
    </div>

    <div class="field-group">
      <div class="field">
        <label>Full Name</label>
        <UiInput
          v-model="fullName"
          placeholder="Jane Smith"
        />
      </div>
      <div class="field">
        <label>Email</label>
        <UiInput
          v-model="email"
          type="email"
          placeholder="you@company.com"
        />
      </div>
      <div class="field">
        <label>Password</label>
        <UiInput
          v-model="password"
          type="password"
          placeholder="Min. 8 characters"
          @keyup.enter="register"
        />
      </div>
    </div>

    <UiButton size="lg" @click="register" :loading="loading" class="w-full">
      Create Account
    </UiButton>

    <p class="switch-link">
      Already have an account?
      <router-link to="/auth/login">Sign in</router-link>
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import UiButton from '@/components/ui/Button.vue'
import UiInput from '@/components/ui/Input.vue'

const router   = useRouter()
const auth     = useAuthStore()
const { showToast } = useToast()

const fullName = ref('')
const email    = ref('')
const password = ref('')
const loading  = ref(false)

async function register() {
  if (!fullName.value || !email.value || !password.value) return
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
  padding: 28px 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-header h2 {
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 4px;
  letter-spacing: -0.3px;
}

.form-header p {
  font-size: 14px;
  color: #64748b;
  margin: 0;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 14px;
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

.field input {
  height: 44px;
  padding: 0 14px;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-size: 15px;
  color: #0f172a;
  background: #f8fafc;
  outline: none;
  transition: border-color .15s, box-shadow .15s;
  font-family: inherit;
}

.field input:focus {
  border-color: #6366f1;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(99,102,241,.12);
}

.field input::placeholder {
  color: #94a3b8;
}

.btn-primary {
  height: 48px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #ffffff;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  letter-spacing: 0.2px;
  transition: opacity .15s, transform .1s;
  font-family: inherit;
  box-shadow: 0 4px 14px rgba(99,102,241,.4);
}

.btn-primary:hover:not(:disabled) { opacity: .9; }
.btn-primary:active:not(:disabled) { transform: scale(.98); }
.btn-primary:disabled { opacity: .6; cursor: not-allowed; }

.btn-spinner, .spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255,255,255,.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin .6s linear infinite;
  display: inline-block;
  flex-shrink: 0;
}
@keyframes spin { to { transform: rotate(360deg); } }

.switch-link {
  text-align: center;
  font-size: 13px;
  color: #64748b;
  margin: 0;
}

.switch-link a {
  color: #6366f1;
  font-weight: 600;
  text-decoration: none;
}

.switch-link a:hover { text-decoration: underline; }
</style>
