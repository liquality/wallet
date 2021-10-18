import Vue from 'vue'
import App from './App.vue'
import store from './store'
import router from './router'
import ToggleButton from 'vue-js-toggle-button'
import VTooltip from 'v-tooltip'

import '@/assets/scss/style.scss'
import FeatureFlags from './utils/featureFlags'

const ldClientSideApiKey = process.env.VUE_APP_LD_CLIENT_SIDE_ID_API_KEY

Vue.use(ToggleButton)
Vue.use(VTooltip)
Vue.use(FeatureFlags, {
  userId: 'wallet user',
  key: ldClientSideApiKey
})
Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
