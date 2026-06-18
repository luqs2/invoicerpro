import { ref, watch, onMounted } from 'vue'

const theme = ref<'light' | 'dark'>('light')

function applyTheme(t: 'light' | 'dark') {
  document.documentElement.classList.toggle('dark', t === 'dark')
}

// Apply theme immediately on import so it's set before any render
if (typeof window !== 'undefined') {
  const stored = localStorage.getItem('theme') as 'light' | 'dark' | null
  if (stored) {
    theme.value = stored
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    theme.value = prefersDark ? 'dark' : 'light'
  }
  applyTheme(theme.value)
}

export function useTheme() {
  onMounted(() => {
    // Ensure it's applied (already done at import, but defensive)
    applyTheme(theme.value)
  })

  watch(theme, (t) => {
    localStorage.setItem('theme', t)
    applyTheme(t)
  })

  function toggleTheme() {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }

  return { theme, toggleTheme }
}
