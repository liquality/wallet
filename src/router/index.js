import Vue from 'vue'
import VueRouter from 'vue-router'

import Wallet from '@/views/v2/Wallet.vue'
import Account from '@/views/v2/Account.vue'
import Swap from '@/views/v2/Swap.vue'
import Send from '@/views/v2/Send.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    component: Wallet
  },
  {
    path: '/account/:asset',
    component: Account
  },
  {
    path: '/account/:asset/swap',
    component: Swap
  },
  {
    path: '/account/:asset/send',
    component: Send
  }
]

const router = new VueRouter({
  mode: 'hash',
  base: process.env.BASE_URL,
  routes
})

export default router
