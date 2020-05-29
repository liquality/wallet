import Vue from 'vue'
import VueRouter from 'vue-router'

import Home from '@/views/Home.vue'
import Generate from '@/views/Generate.vue'
import ChangePassword from '@/views/ChangePassword.vue'
import Import from '@/views/Import.vue'
import Wallet from '@/views/Wallet.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    component: Home
  },
  {
    path: '/generate',
    component: Generate
  },
  {
    path: '/changePassword',
    component: ChangePassword
  },
  {
    path: '/import',
    component: Import
  },
  {
    path: '/wallet/:walletId',
    component: Wallet
  }
]

const router = new VueRouter({
  base: process.env.BASE_URL,
  routes
})

export default router
