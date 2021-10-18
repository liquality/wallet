import Vue from 'vue'
import App from './App.vue'
import store from './store'
import router from './router'
import ToggleButton from 'vue-js-toggle-button'
import VTooltip from 'v-tooltip'

import '@/assets/scss/style.scss'
import FeatureFlags from './utils/featureFlags'

Vue.use(ToggleButton)
Vue.use(VTooltip)
Vue.use(FeatureFlags, {
  userId: 'aa0ceb',
  key: '61672acc7a090f3159d47b8a'
})
Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
