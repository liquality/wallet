import Vue from 'vue'
import VueRouter from 'vue-router'
import store, { broker } from '../store'

import Splash from '@/views/Splash.vue'
import OnboardingSetup from '@/views/Onboarding/OnboardingSetup.vue'
import OnboardingHome from '@/views/Onboarding/OnboardingHome.vue'
import ImportWallet from '@/views/ImportWallet.vue'
import Open from '@/views/Open.vue'
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
    component: Splash,
    name: 'Splash',
    meta: { protect: false }
  },
  {
    path: '/onboarding/import',
    component: ImportWallet,
    meta: { protect: false }
  },
  {
    path: '/open',
    name: 'OpenWallet',
    component: Open,
    meta: { protect: false }
  },
  {
    path: '/onboarding/setup/:seedphrase?',
    component: OnboardingSetup,
    name: 'OnboardingSetup',
    props: true,
    meta: { protect: false }
  },
  {
    path: '/onboarding/home',
    component: OnboardingHome,
    name: 'OnboardingHome',
    meta: { protect: false }
  },
  // Onboarding

  // Settings
  {
    path: '/settings',
    component: Settings,
    meta: { protect: true }
  },
  {
    path: '/settings/experiments',
    component: Experiments,
    meta: { protect: true }
  },
  {
    path: '/settings/manage-assets',
    component: ManageAssets,
    meta: { protect: true }
  },
  {
    path: '/settings/manage-assets/custom-token',
    component: CustomToken,
    meta: { protect: true }
  },
  // Settings

  // Wallet
  {
    path: '/wallet',
    name: 'Wallet',
    component: Wallet,
    meta: { protect: true },
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
    props: true,
    meta: { protect: true }
  },
  {
    path: '/details/transaction/:id',
    component: TransactionDetails,
    name: 'TransactionDetails',
    props: true,
    meta: { protect: true }
  },

  // Accounts
  {
    path: '/accounts/management',
    component: ManageAccounts,
    name: 'ManageAccounts',
    props: true,
    meta: { protect: true }
  },
  {
    path: '/accounts/create/:chainId?',
    component: CreateAccount,
    name: 'CreateAccount',
    props: true,
    meta: { protect: true }
  },
  {
    path: '/accounts/hardware-wallet',
    component: HardwareWallet,
    props: true,
    name: 'HardwareWallet',
    meta: { protect: true }
  },
  {
    name: 'Account',
    path: '/accounts/:accountId/:asset',
    component: Account,
    props: true,
    meta: { protect: true }
  },
  {
    name: 'Send',
    path: '/accounts/:accountId/:asset/send',
    component: Send,
    props: true,
    meta: { protect: true }
  },
  {
    name: 'Receive',
    path: '/accounts/:accountId/:asset/receive',
    component: Receive,
    props: true,
    meta: { protect: true }
  },
  {
    name: 'Swap',
    path: '/accounts/:accountId/:routeAsset/swap',
    component: Swap,
    props: true,
    meta: { protect: true }
  },

  // Assets list
  {
    path: '/assets/:action',
    component: AssetList,
    props: true,
    meta: { protect: true }
  },
  // Wallet

  // Injection
  {
    path: '/request-unlock',
    component: RequestUnlockWallet,
    meta: { protect: false }
  },
  {
    path: '/enable',
    component: Enable,
    meta: { protect: false }
  },
  {
    path: '/permission/send',
    component: PermissionSend,
    meta: { protect: false }
  },
  {
    path: '/permission/terra',
    component: PermissionTerra,
    meta: { protect: false }
  },
  {
    path: '/permission/sign',
    component: PermissionSign,
    meta: { protect: false }
  },
  {
    path: '/permission/signPsbt',
    component: PermissionSignPsbt,
    meta: { protect: false }
  },
  {
    path: '/permission/default',
    component: Permission,
    meta: { protect: false }
  },
  // Injection

  // SeedPhrase
  {
    path: '/privacywarning',
    component: Warning,
    meta: { protect: false }
  },
  {
    path: '/seedlogin',
    component: LoginPhrase,
    meta: { protect: false }
  },
  {
    path: '/seedreveal',
    component: PhraseReveal,
    meta: { protect: true }
  },

  // Export Private Key
  {
    path: '/export/:accountId',
    meta: { protect: true },
    component: Warning,
    props: ({ params: { accountId } }) => ({
      title: 'Show Private Key?',
      nextPath: `/export/${accountId}/login`
    })
  },
  {
    path: '/export/:accountId/login',
    component: LoginPhrase,
    meta: { protect: true },
    props: ({ params: { accountId } }) => ({
      title: 'Sign-in to Export Private Key',
      nextPath: `/export/${accountId}/reveal`
    })
  },
  {
    path: '/export/:accountId/reveal',
    component: ExportPrivateKey,
    name: 'ExportPrivateKey',
    props: true,
    meta: { protect: true }
  }
]

const router = new VueRouter({
  base: process.env.BASE_URL,
  routes
})

router.beforeEach(async (to, from, next) => {
  // wait for the broker
  await broker.ready.promise
  if (!store.state.unlockedAt && to.meta?.protect == true && to.name !== 'Splash') {
    next({ name: 'Splash' })
  } else next()
})

export default router
