import Vue from 'vue'
import VueRouter from 'vue-router'

import Splash from '@/views/Splash.vue'
import OnboardingPassword from '@/views/Onboarding/OnboardingPassword.vue'
import ImportWallet from '@/views/ImportWallet.vue'
import UnlockWallet from '@/views/UnlockWallet.vue'
import BackupWallet from '@/views/BackupWallet.vue'
import MainnetWarning from '@/views/MainnetWarning.vue'
import Wallet from '@/views/Wallet.vue'
import Account from '@/views/Account.vue'
import Send from '@/views/Send.vue'
import SendConfirm from '@/views/SendConfirm.vue'
import Receive from '@/views/Receive.vue'
import Swap from '@/views/Swap.vue'
import SwapConfirm from '@/views/SwapConfirm.vue'

import Enable from '@/views/Enable.vue'
import Permission from '@/views/Permission.vue'

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
    name: 'Account',
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
  },
  {
    path: '/enable',
    component: Enable
  },
  {
    path: '/permission',
    component: Permission
  }
]

const router = new VueRouter({
  base: process.env.BASE_URL,
  routes
})

export default router
