import Vue from 'vue'
import App from './App.vue'
import store from './store'
import router from './router'
import ToggleButton from 'vue-js-toggle-button'
import VTooltip from 'v-tooltip'
import VueAnalytics from 'vue-analytics'

import '@/assets/scss/style.scss'

Vue.use(ToggleButton)
Vue.use(VTooltip)
Vue.use(VueAnalytics, {
  id: process.env.VUE_APP_GA_TRACKING_ID,
  router,
  autoTracking: {
    exception: true,
    exceptionLogs: true
  },
  debug: {
    enabled: true,
    trace: true,
    sendHitTask: true
  }
})
Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: (h) => h(App)
}).$mount('#app')
