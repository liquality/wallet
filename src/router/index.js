import Vue from 'vue'
import VueRouter from 'vue-router'

import Splash from '@/views/v2/Splash.vue'
import UnlockWallet from '@/views/v2/UnlockWallet.vue'
import CreateWallet from '@/views/v2/CreateWallet.vue'
import BackupWallet from '@/views/v2/BackupWallet.vue'
import WalletLocked from '@/views/v2/WalletLocked.vue'

import Wallet from '@/views/v2/Wallet.vue'
import Account from '@/views/v2/Account.vue'
import Send from '@/views/v2/Send.vue'
import SendConfirm from '@/views/v2/SendConfirm.vue'
import Receive from '@/views/v2/Receive.vue'
import Swap from '@/views/v2/Swap.vue'
import SwapConfirm from '@/views/v2/SwapConfirm.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    component: Splash
  },
  {
    path: '/open',
    component: UnlockWallet
  },
  {
    path: '/create',
    component: CreateWallet
  },
  {
    path: '/backup',
    component: BackupWallet
  },
  {
    path: '/locked',
    component: WalletLocked
  },
  {
    path: '/wallet',
    component: Wallet
  },
  {
    path: '/account/:asset',
    component: Account
  },
  {
    path: '/account/:asset/send',
    component: Send
  },
  {
    path: '/account/:asset/send/confirm',
    component: SendConfirm
  },
  {
    path: '/account/:asset/receive',
    component: Receive
  },
  {
    path: '/account/:asset/swap',
    component: Swap
  },
  {
    path: '/account/:asset/swap/confirm',
    component: SwapConfirm
  }
]

const router = new VueRouter({
  mode: 'hash',
  base: process.env.BASE_URL,
  routes
})

export default router
