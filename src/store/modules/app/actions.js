import { requestOriginAccess } from './requestOriginAccess'
import { requestPermission } from './requestPermission'
import { requestUnlockWallet } from './requestUnlockWallet'
import { replyOriginAccess } from './replyOriginAccess'
import { replyPermission } from './replyPermission'
import { replyUnlockWallet } from './replyUnlockWallet'
import { executeRequest } from './executeRequest'
import { handlePaymentUri } from './handlePaymentUri'
import { initializeAnalytics } from './initializeAnalytics'
import { checkAnalyticsOptIn } from './checkAnalyticsOptIn'
import { chains } from '@liquality/cryptoassets'

export const actions = {
  setAnalyticsOptInModalOpen: ({ commit }, { open }) => {
    commit('SET_ANALYTICS_OPTIN_MODAL_OPEN', { open })
  },
  setBuyCryptoModalOpen: ({ commit, dispatch }, { open, chain, asset, address, screen }) => {
    commit('SET_BUY_CRYPTO_MODAL_OPEN', { open, chain, asset, address })
    if (screen === 'EmptyActivity') {
      dispatch(
        'trackAnalytics',
        {
          event: `Click Buy Crypto from EmptyActivity screen`,
          properties: {
            category: 'Buy Crypto'
          }
        },
        { root: true }
      )
    } else if (screen === 'Receive') {
      dispatch(
        'trackAnalytics',
        {
          event: `Click Buy Crypto from Receive screen`,
          properties: {
            category: 'Buy Crypto',
            chain,
            asset,
            address
          }
        },
        { root: true }
      )
    }
  },
  setBuyCryptoOverviewModalOpen: ({ dispatch, commit }, { open }) => {
    commit('SET_BUY_CRYPTO_OVERVIEW_MODAL_OPEN', { open })
    if (open) {
      dispatch(
        'trackAnalytics',
        {
          event: `Click Buy Crypto from Overview`,
          properties: {
            action: open ? 'open' : 'close',
            category: 'Buy Crypto',
            label: `Buy Crypto from Overview screen`
          }
        },
        { root: true }
      )
    }
  },
  openTransakWidgetTab: ({ dispatch, rootState }, { chain, asset, address }) => {
    const widgetUrl = process.env.VUE_APP_TRANSAK_WIDGET_URL
    const apiKey = process.env.VUE_APP_TRANSAK_API_KEY
    let url = `${widgetUrl}?apiKey=${apiKey}&disablePaymentMethods=apple_pay&cryptoCurrencyCode=${asset}`

    const _address = chains[chain]?.formatAddress(address, rootState.activeNetwork)
    url = `${url}&walletAddress=${_address}`

    chrome.tabs.create({ url })
    dispatch('setBuyCryptoModalOpen', { open: false })
    dispatch('setBuyCryptoOverviewModalOpen', { open: false })
    dispatch(
      'trackAnalytics',
      {
        event: 'Continue with Transak clicked',
        category: 'Buy Crypto',
        label: 'Buy Crypto Continue with Transak clicked'
      },
      { root: true }
    )
  },
  setLedgerSignRequestModalOpen: ({ commit }, { open }) => {
    commit('SET_LEDGER_SIGN_REQUEST_MODAL_OPEN', { open })
  },
  settingsModalOpen: ({ commit }, isOpen) => {
    commit('SET_SETTINGS_MODAL_OPEN', isOpen)
  },
  requestOriginAccess,
  requestPermission,
  requestUnlockWallet,
  replyOriginAccess,
  replyUnlockWallet,
  replyPermission,
  executeRequest,
  handlePaymentUri,
  initializeAnalytics,
  checkAnalyticsOptIn
}
