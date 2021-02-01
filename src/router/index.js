import Vue from 'vue'
import VueRouter from 'vue-router'

import Splash from '@/views/Splash.vue'
import OnboardingPassword from '@/views/Onboarding/OnboardingPassword.vue'
import ImportWallet from '@/views/ImportWallet.vue'
import UnlockWallet from '@/views/UnlockWallet.vue'
import BackupWallet from '@/views/BackupWallet.vue'
import Wallet from '@/views/Wallet/Wallet.vue'
import Account from '@/views/Account.vue'
import SwapDetails from '@/views/Details/SwapDetails.vue'
import TransactionDetails from '@/views/Details/TransactionDetails.vue'
import Send from '@/views/Send.vue'
import Receive from '@/views/Receive.vue'
import Swap from '@/views/Swap.vue'

import Settings from '@/views/Settings'
import ManageAssets from '@/views/ManageAssets'
import CustomToken from '@/views/CustomToken'

import Enable from '@/views/Enable.vue'
import PermissionSend from '@/views/PermissionSend.vue'
import PermissionSign from '@/views/PermissionSign.vue'
import PermissionSignPsbt from '@/views/PermissionSignPsbt.vue'
import Permission from '@/views/Permission.vue'
import WalletAssets from '@/views/Wallet/WalletAssets.vue'
import WalletActivity from '@/views/Wallet/WalletActivity.vue'
import AssetList from '@/views/AssetList.vue'

Vue.use(VueRouter)

const routes = [
  // Onboarding
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
  // Onboarding

  // Settings
  {
    path: '/settings',
    component: Settings
  },
  {
    path: '/settings/manage-assets',
    component: ManageAssets
  },
  {
    path: '/settings/manage-assets/custom-token',
    component: CustomToken
  },
  // Settings

  // Wallet
  {
    path: '/wallet',
    component: Wallet,
    children: [
      {
        path: 'assets',
        component: WalletAssets,
        name: 'WalletAssets'
      },
      {
        path: 'activity',
        component: WalletActivity,
        name: 'WalletActivity'
      },
      {
        path: '',
        redirect: 'assets'
      }
    ]
  },
  // Details
  {
    path: '/details/swap/:id',
    component: SwapDetails,
    name: 'SwapDetails',
    props: true
  },
  {
    path: '/details/transaction/:id',
    component: TransactionDetails,
    name: 'TransactionDetails',
    props: true
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
    path: '/account/:asset/receive',
    component: Receive,
    props: true
  },
  {
    path: '/account/:routeAsset/swap',
    component: Swap,
    props: true
  },

  // Assets list
  {
    path: '/assets/:action',
    component: AssetList,
    props: true
  },
  // Wallet

  // Injection
  {
    path: '/enable',
    component: Enable
  },
  {
    path: '/permission/send',
    component: PermissionSend
  },
  {
    path: '/permission/sign',
    component: PermissionSign
  },
  {
    path: '/permission/signPsbt',
    component: PermissionSignPsbt
  },
  {
    path: '/permission/default',
    component: Permission
  }
  // Injection
]

const router = new VueRouter({
  base: process.env.BASE_URL,
  routes
})

export default router
