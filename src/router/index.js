import Vue from 'vue'
import VueRouter from 'vue-router'

import Wallet from '@/views/v2/Wallet.vue'
import Account from '@/views/v2/Account.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    component: Wallet
  },
  {
    path: '/account/:asset',
    component: Account
  }
]

const router = new VueRouter({
  mode: 'hash',
  base: process.env.BASE_URL,
  routes
})

export default router
