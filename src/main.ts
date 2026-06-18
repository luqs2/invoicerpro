import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

/* Tailwind */
import './assets/tailwind.css'

/* Shared utilities */
import './assets/utilities.css'

/* App theme */
import './theme/variables.css'

/* Apply stored theme before first render */
import { useTheme } from './composables/useTheme'
useTheme()

const pinia = createPinia()
const app   = createApp(App)
  .use(pinia)
  .use(router)

router.isReady().then(() => app.mount('#app'))
