import Vue from 'vue'
import App from './App.vue'
import store from './store'
import router from './router'
import { Localization } from './utils/localization'
import ToggleButton from 'vue-js-toggle-button'
import VTooltip from 'v-tooltip'
import firebase from 'firebase'

import '@/assets/scss/style.scss'

const firebaseConfig = {
  apiKey: process.env.VUE_APP_FIREBASE_API_KEY,
  authDomain: process.env.VUE_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.VUE_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.VUE_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VUE_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VUE_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VUE_APP_FIREBASE_APP_ID,
  measurementId: process.env.VUE_APP_FIREBASE_MEASUREMENT_ID
}

firebase.initializeApp(firebaseConfig)

Vue.use(ToggleButton)
Vue.use(VTooltip)
Vue.config.productionTip = false
Vue.use(Localization)

new Vue({
  router,
  store,
  render: (h) => h(App)
}).$mount('#app')
