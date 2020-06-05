import Vue from 'vue'
import VueRouter from 'vue-router'

import Splash from '@/views/v2/Splash.vue'
import OnboardingPassword from '@/views/v2/Onboarding/OnboardingPassword.vue'
import ImportWallet from '@/views/v2/ImportWallet.vue'
import UnlockWallet from '@/views/v2/UnlockWallet.vue'
import BackupWallet from '@/views/v2/BackupWallet.vue'
import MainnetWarning from '@/views/v2/MainnetWarning.vue'
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
    name: 'OnboardingPassword',
    path: '/onboarding/password',
    component: OnboardingPassword,
    props: true
  },
  {
    path: '/onboarding/import',
    component: ImportWallet
  },
  {
    path: '/open',
    component: UnlockWallet
  },
  {
    path: '/backup',
    component: BackupWallet
  },
  {
    path: '/wallet',
    component: Wallet
  },
  {
    path: '/wallet/warning',
    component: MainnetWarning
  },
  {
    path: '/account/:asset',
    component: Account,
    props: true
  },
  {
    path: '/account/:asset/send',
    component: Send,
    props: true
  },
  {
    name: 'SendConfirm',
    path: '/account/:asset/send/confirm',
    component: SendConfirm,
    props: true
  },
  {
    path: '/account/:asset/receive',
    component: Receive,
    props: true
  },
  {
    path: '/account/:asset/swap',
    component: Swap,
    props: true
  },
  {
    name: 'SwapConfirm',
    path: '/account/:asset/swap/confirm',
    component: SwapConfirm,
    props: true
  }
]

const router = new VueRouter({
  base: process.env.BASE_URL,
  routes
})

export default router
