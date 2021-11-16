/* eslint-disable import/first */
// import devtools from '@vue/devtools'
let devtools
if (process.env.NODE_ENV === 'development') devtools = require('@vue/devtools')
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex) // must call before a store instance is created

import App from './App.vue'
import store from './store'
import router from './router'
import ToggleButton from 'vue-js-toggle-button'
import VTooltip from 'v-tooltip'

import '@/assets/scss/style.scss'

// Connect to Vue devtools (localhost only)
if (process.env.NODE_ENV === 'development') devtools.connect()

Vue.use(ToggleButton)
Vue.use(VTooltip)
Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
