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

export const actions = {
  setAnalyticsOptInModalOpen: ({ commit }, { open }) => {
    commit('SET_ANALYTICS_OPTIN_MODAL_OPEN', { open })
  },
  setBuyCryptoModalOpen: ({ commit, dispatch }, { open, chain, asset, address }) => {
    commit('SET_BUY_CRYPTO_MODAL_OPEN', { open, chain, asset, address })
    dispatch(
      'trackAnalytics',
      {
        event: 'Buy Crypto',
        properties: {
          action: open ? 'open' : 'close',
          category: 'Buy Crypto options clicked from receive screen',
          chain: chain,
          asset: asset
        }
      },
      { root: true }
    )
  },
  setBuyCryptoOverviewModalOpen: ({ commit }, { open }) => {
    commit('SET_BUY_CRYPTO_OVERVIEW_MODAL_OPEN', { open })
  },
  openTransakWidgetTab: ({ dispatch }, { chain, asset, address }) => {
    const widgetUrl = process.env.VUE_APP_TRANSAK_WIDGET_URL
    const apiKey = process.env.VUE_APP_TRANSAK_API_KEY
    const url = `${widgetUrl}?apiKey=${apiKey}&network=${chain}&cryptoCurrencyCode=${asset}&walletAddress=${address}`
    chrome.tabs.create({ url })
    dispatch('setBuyCryptoModalOpen', { open: false })
    dispatch('setBuyCryptoOverviewModalOpen', { open: false })
    dispatch('trackAnalytics', {
      event: 'buy_crypto_modal_close',
      chain: chain,
      asset: asset,
      address: address
    })
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
