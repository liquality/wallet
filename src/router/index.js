import Vue from 'vue'
import VueRouter from 'vue-router'
import store, { broker } from '../store'

import Splash from '@/views/Splash.vue'
import ManageAssets from '@/views/ManageAssets'
import OpenWallet from '@/views/Open.vue'
import WalletAssets from '@/views/Wallet/WalletAssets.vue'
import Wallet from '@/views/Wallet/Wallet.vue'

const Warning = () => import('@/views/Onboarding/SeedPhrase/Warning.vue')
const LoginPhrase = () => import('@/views/Onboarding/SeedPhrase/LoginPhrase.vue')

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
    component: () => import('@/views/Onboarding/ImportWallet.vue'),
    meta: { protect: false }
  },
  {
    path: '/open',
    name: 'OpenWallet',
    component: OpenWallet,
    meta: { protect: false }
  },
  {
    path: '/onboarding/setup/:seedphrase?',
    component: () => import('@/views/Onboarding/OnboardingSetup.vue'),
    name: 'OnboardingSetup',
    props: true,
    meta: { protect: false }
  },
  {
    path: '/onboarding/home',
    component: () => import('@/views/Onboarding/OnboardingHome.vue'),
    name: 'OnboardingHome',
    meta: { protect: false }
  },
  // Onboarding

  // Settings
  {
    path: '/settings',
    component: () => import('@/views/Settings'),
    meta: { protect: true },
    children: [
      {
        path: '',
        name: 'AllSettings',
        component: () => import('@/views/SettingItems.vue')
      },
      {
        path: 'networks',
        name: 'NetworkSettings',
        component: () => import('@/views/NetworkSettings.vue')
      }
    ]
  },
  {
    path: '/settings/experiments',
    component: () => import('@/views/Experiments'),
    name: 'Experiments',
    meta: { protect: true }
  },
  {
    path: '/settings/manage-assets',
    component: ManageAssets,
    name: 'ManageAssets',
    meta: { protect: true }
  },
  {
    path: '/settings/manage-assets/custom-token',
    component: () => import('@/views/CustomToken'),
    name: 'CustomToken',
    meta: { protect: true }
  },
  // Settings

  // Wallet
  {
    path: '/wallet',
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
        component: () => import('@/views/Wallet/WalletActivity.vue'),
        name: 'WalletActivity'
      },
      {
        path: 'nfts',
        component: () => import('@/views/Wallet/WalletNFTs.vue'),
        name: 'WalletNFTs'
      },
      {
        path: '',
        redirect: 'assets'
      }
    ]
  },
  {
    path: '/wallet/nfts/activity/:id',
    component: () => import('@/views/Wallet/NFTActivity.vue'),
    name: 'NFTActivity',
    props: true
  },
  {
    path: '/wallet/nfts/send',
    component: () => import('@/views/Send/SendNFT.vue'),
    name: 'SendNFT'
  },
  {
    path: '/details/nft-transaction/:id',
    component: () => import('@/views/Details/NFTTransactionDetails.vue'),
    name: 'NFTTransactionDetails',
    props: true
  },
  // Details
  {
    path: '/details/swap/:id',
    component: () => import('@/views/Details/SwapDetails.vue'),
    name: 'SwapDetails',
    props: true,
    meta: { protect: true }
  },
  {
    path: '/details/transaction/:id',
    component: () => import('@/views/Details/TransactionDetails.vue'),
    name: 'TransactionDetails',
    props: true,
    meta: { protect: true }
  },
  {
    path: '/details/nft-collection/:id',
    component: () => import('@/views/Details/NFTCollectionList.vue'),
    name: 'NFTCollectionList',
    props: true
  },
  {
    path: '/details/nft-asset/:id',
    component: () => import('@/views/Details/NFTAssetDetails.vue'),
    name: 'NFTAssetDetails',
    props: true
  },

  // Accounts
  {
    path: '/accounts/management',
    component: () => import('@/views/Accounts/Manage.vue'),
    name: 'ManageAccounts',
    props: true,
    meta: { protect: true }
  },
  {
    path: '/accounts/create/:chainId?',
    component: () => import('@/views/Accounts/Create.vue'),
    name: 'CreateAccount',
    props: true,
    meta: { protect: true }
  },
  {
    path: '/accounts/edit/:accountId?',
    component: () => import('@/views/Accounts/Edit.vue'),
    name: 'EditAccount',
    props: true,
    meta: { protect: true }
  },
  {
    path: '/accounts/hardware-wallet',
    component: () => import('@/views/Accounts/HardwareWallet/HardwareWallet.vue'),
    props: true,
    name: 'HardwareWallet',
    meta: { protect: true }
  },
  {
    name: 'Account',
    path: '/accounts/:accountId/:asset',
    component: () => import('@/views/Account.vue'),
    props: true,
    meta: { protect: true }
  },
  {
    name: 'Send',
    path: '/accounts/:accountId/:asset/send',
    component: () => import('@/views/Send/Send.vue'),
    props: true,
    meta: { protect: true }
  },
  {
    name: 'Receive',
    path: '/accounts/:accountId/:asset/receive',
    component: () => import('@/views/Receive.vue'),
    props: true,
    meta: { protect: true }
  },
  {
    name: 'Swap',
    path: '/accounts/:accountId/:routeAsset/swap',
    component: () => import('@/views/Swap/Swap.vue'),
    props: true,
    meta: { protect: true }
  },

  // Assets list
  {
    path: '/assets/:action',
    component: () => import('@/views/AssetList.vue'),
    props: true,
    meta: { protect: true }
  },

  // Injection
  {
    path: '/request-unlock',
    component: () => import('@/views/RequestUnlockWallet.vue'),
    meta: { protect: false }
  },
  {
    path: '/enable',
    component: () => import('@/views/Enable.vue'),
    meta: { protect: false }
  },
  {
    path: '/permission/send',
    component: () => import('@/views/PermissionSend.vue'),
    meta: { protect: false }
  },
  {
    path: '/permission/terra',
    component: () => import('@/views/PermissionTerra.vue'),
    meta: { protect: false }
  },
  {
    path: '/permission/sign',
    component: () => import('@/views/PermissionSign.vue'),
    meta: { protect: false }
  },
  {
    path: '/permission/signPsbt',
    component: () => import('@/views/PermissionSignPsbt.vue'),
    meta: { protect: false }
  },
  {
    path: '/permission/default',
    component: () => import('@/views/Permission.vue'),
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
    component: () => import('@/views/Onboarding/SeedPhrase/PhraseReveal'),
    meta: { protect: true }
  },

  // Export Private Key

  {
    path: '/export/:accountId',
    meta: { protect: true },
    component: Warning,
    props: ({ params: { accountId } }) => ({
      titleKey: 'privateKey',
      nextPath: `/export/${accountId}/login`
    })
  },
  {
    path: '/export/:accountId/login',
    component: LoginPhrase,
    meta: { protect: true },
    props: ({ params: { accountId } }) => ({
      titleKey: 'export',
      nextPath: `/export/${accountId}/reveal`
    })
  },
  {
    path: '/export/:accountId/reveal',
    component: () => import('@/views/Accounts/ExportPrivateKey.vue'),
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
