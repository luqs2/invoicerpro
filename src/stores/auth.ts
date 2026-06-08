import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/services/supabase'
import type { User } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  const user        = ref<User | null>(null)
  const loading     = ref(false)
  const initialized = ref(false)

  const isAuthed = computed(() => !!user.value)

  // Called once by the router guard on first navigation
  async function init() {
    if (initialized.value) return
    initialized.value = true

    const { data } = await supabase.auth.getSession()
    if (data.session?.user) {
      await fetchProfile(data.session.user.id)
    }

    // Keep in sync for the rest of the session
    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) await fetchProfile(session.user.id)
      else user.value = null
    })
  }

  async function fetchProfile(id: string) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single()
    user.value = data
  }

  async function login(email: string, password: string) {
    loading.value = true
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    loading.value = false
    if (error) throw error
  }

  async function register(email: string, password: string, fullName: string) {
    loading.value = true
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
    loading.value = false
    if (error) throw error
  }

  async function logout() {
    await supabase.auth.signOut()
    user.value = null
    initialized.value = false
  }

  return { user, loading, isAuthed, initialized, init, login, register, logout }
})
