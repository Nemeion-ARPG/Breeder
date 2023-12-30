import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue-next/dist/bootstrap-vue-next.css'

import './assets/main.css'

import './extensions/Array'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'

import storeReset from './plugins/store-reset'

const pinia = createPinia()
pinia.use(storeReset)

const app = createApp(App)
app.use(pinia)

app.mount('#app')
