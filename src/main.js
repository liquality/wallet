import Vue from 'vue'
import App from './App.vue'
import store from './store'
import router from './router'
import ToggleButton from 'vue-js-toggle-button'
import VTooltip from 'v-tooltip'

import '@/assets/scss/style.scss'

Vue.use(ToggleButton)
Vue.use(VTooltip)
Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
