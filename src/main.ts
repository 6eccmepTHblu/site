import './style.css'

// App
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)

// Pinia
import { createPinia } from 'pinia'

const pinia = createPinia()
app.use(pinia)

// Primei cons
import 'primeicons/primeicons.css'

// Prime Vue
import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'

app.use(PrimeVue, {
  theme: {
    preset: Aura,
  },
})

// Vue Query
import { VueQueryPlugin } from 'vue-query'
app.use(VueQueryPlugin)

app.mount('#app')
