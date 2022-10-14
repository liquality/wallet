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
  apiKey: 'AIzaSyB7ToaHRn-eoi1xokl5cJItApkY-uIemO4',
  authDomain: 'wallet-extension-b4cb6.firebaseapp.com',
  databaseURL: 'https://wallet-extension-b4cb6-default-rtdb.firebaseio.com',
  projectId: 'wallet-extension-b4cb6',
  storageBucket: 'wallet-extension-b4cb6.appspot.com',
  messagingSenderId: '1029144929192',
  appId: '1:1029144929192:web:a6228a9cf987a6ca9b739d',
  measurementId: 'G-YV65VT0L08'
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
