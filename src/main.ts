import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

/* Tailwind */
import './assets/tailwind.css'

/* App theme */
import './theme/variables.css'

const pinia = createPinia()
const app   = createApp(App)
  .use(pinia)
  .use(router)

router.isReady().then(() => app.mount('#app'))
