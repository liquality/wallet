import Vue from 'vue'
import App from './App.vue'
import store from './store'
import router from './router'
import ToggleButton from 'vue-js-toggle-button'
import VTooltip from 'v-tooltip'
import Hotjar from 'vue-hotjar'

import '@/assets/scss/style.scss'

Vue.use(Hotjar, {
  id: '1260353'
})
Vue.use(ToggleButton)
Vue.use(VTooltip)
Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
