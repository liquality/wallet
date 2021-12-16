import Vue from 'vue'
import VueRouter from 'vue-router'

import Splash from '@/views/Splash.vue'
import OnboardingSetup from '@/views/Onboarding/OnboardingSetup.vue'
import OnboardingHome from '@/views/Onboarding/OnboardingHome.vue'
import ImportWallet from '@/views/ImportWallet.vue'
import UnlockWallet from '@/views/UnlockWallet.vue'
import Wallet from '@/views/Wallet/Wallet.vue'
import Account from '@/views/Account.vue'
import SwapDetails from '@/views/Details/SwapDetails.vue'
import TransactionDetails from '@/views/Details/TransactionDetails.vue'
import Send from '@/views/Send/Send.vue'
import Receive from '@/views/Receive.vue'
import Swap from '@/views/Swap/Swap.vue'

import Settings from '@/views/Settings'
import Experiments from '@/views/Experiments'
import ManageAssets from '@/views/ManageAssets'
import CustomToken from '@/views/CustomToken'

import RequestUnlockWallet from '@/views/RequestUnlockWallet.vue'
import Enable from '@/views/Enable.vue'
import PermissionSend from '@/views/PermissionSend.vue'
import PermissionSign from '@/views/PermissionSign.vue'
import PermissionSignPsbt from '@/views/PermissionSignPsbt.vue'
import PermissionTerra from '@/views/PermissionTerra.vue'
import Permission from '@/views/Permission.vue'
import WalletAssets from '@/views/Wallet/WalletAssets.vue'
import WalletActivity from '@/views/Wallet/WalletActivity.vue'
import AssetList from '@/views/AssetList.vue'
import HardwareWallet from '@/views/Accounts/HardwareWallet/HardwareWallet.vue'
import CreateAccount from '@/views/Accounts/Create.vue'
import ManageAccounts from '@/views/Accounts/Manage.vue'
import ExportPrivateKey from '@/views/Accounts/ExportPrivateKey.vue'
import Warning from '@/views/Onboarding/SeedPhrase/Warning.vue'
import LoginPhrase from '@/views/Onboarding/SeedPhrase/LoginPhrase.vue'
import PhraseReveal from '@/views/Onboarding/SeedPhrase/PhraseReveal'

Vue.use(VueRouter)

const routes = [
  // Onboarding
  {
    path: '/',
    component: Splash
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
    path: '/onboarding/setup/:seedphrase?',
    component: OnboardingSetup,
    name: 'OnboardingSetup',
    props: true
  },
  {
    path: '/onboarding/home',
    component: OnboardingHome,
    name: 'OnboardingHome'
  },
  // Onboarding

  // Settings
  {
    path: '/settings',
    component: Settings
  },
  {
    path: '/settings/experiments',
    component: Experiments
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
    name: 'Wallet',
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

  // Accounts
  {
    path: '/accounts/management',
    component: ManageAccounts,
    name: 'ManageAccounts',
    props: true
  },
  {
    path: '/accounts/create/:chainId?',
    component: CreateAccount,
    name: 'CreateAccount',
    props: true
  },
  {
    path: '/accounts/hardware-wallet',
    component: HardwareWallet,
    props: true
  },
  {
    name: 'Account',
    path: '/accounts/:accountId/:asset',
    component: Account,
    props: true
  },
  {
    name: 'Send',
    path: '/accounts/:accountId/:asset/send',
    component: Send,
    props: true
  },
  {
    name: 'Receive',
    path: '/accounts/:accountId/:asset/receive',
    component: Receive,
    props: true
  },
  {
    name: 'Swap',
    path: '/accounts/:accountId/:routeAsset/swap',
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
    path: '/request-unlock',
    component: RequestUnlockWallet
  },
  {
    path: '/enable',
    component: Enable
  },
  {
    path: '/permission/send',
    component: PermissionSend
  },
  {
    path: '/permission/terra',
    component: PermissionTerra
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
  },
  // Injection

  // SeedPhrase
  {
    path: '/privacywarning',
    component: Warning
  },
  {
    path: '/seedlogin',
    component: LoginPhrase
  },
  {
    path: '/seedreveal',
    component: PhraseReveal
  },

  // Export Private Key
  {
    path: '/export/:accountId',
    component: Warning,
    props: ({ params: { accountId } }) => ({
      title: 'Show Private Key?',
      nextPath: `/export/${accountId}/login`
    })
  },
  {
    path: '/export/:accountId/login',
    component: LoginPhrase,
    props: ({ params: { accountId } }) => ({
      title: 'Sign-in to Export Private Key',
      nextPath: `/export/${accountId}/reveal`
    })
  },
  {
    path: '/export/:accountId/reveal',
    component: ExportPrivateKey,
    name: 'ExportPrivateKey',
    props: true
  }
]

const router = new VueRouter({
  base: process.env.BASE_URL,
  routes
})

export default router
