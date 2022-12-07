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
import { getChain } from '@liquality/cryptoassets'
import { trackAnalytics } from './trackAnalytics'

export const actions = {
  setAnalyticsOptInModalOpen: ({ commit }, { open }) => {
    commit('SET_ANALYTICS_OPTIN_MODAL_OPEN', { open })
  },
  setBuyCryptoModalOpen: ({ commit, dispatch }, { open, chain, asset, address, screen }) => {
    commit('SET_BUY_CRYPTO_MODAL_OPEN', { open, chain, asset, address })
    if (screen === 'EmptyActivity') {
      dispatch('trackAnalytics', {
        event: `Click Buy Crypto from EmptyActivity screen`,
        properties: {
          category: 'Buy Crypto'
        }
      })
    } else if (screen === 'Receive') {
      dispatch('trackAnalytics', {
        event: `Click Buy Crypto from Receive screen`,
        properties: {
          category: 'Buy Crypto',
          chain,
          asset,
          address
        }
      })
    }
  },
  setBuyCryptoOverviewModalOpen: ({ dispatch, commit }, { open }) => {
    commit('SET_BUY_CRYPTO_OVERVIEW_MODAL_OPEN', { open })
    if (open) {
      dispatch('trackAnalytics', {
        event: `Click Buy Crypto from Overview`,
        properties: {
          action: open ? 'open' : 'close',
          category: 'Buy Crypto',
          label: `Buy Crypto from Overview screen`
        }
      })
    }
  },
  setWhatsNewModalContent: ({ commit }, { content }) => {
    commit('SET_WHATS_NEW_MODAL_CONTENT', { content })
  },
  openTransakWidgetTab: ({ dispatch, rootState }, { chain, asset, address }) => {
    const widgetUrl = process.env.VUE_APP_TRANSAK_WIDGET_URL
    const apiKey = process.env.VUE_APP_TRANSAK_API_KEY
    let url = `${widgetUrl}?apiKey=${apiKey}&disablePaymentMethods=apple_pay&cryptoCurrencyCode=${asset}&network=${chain}`

    const _address = getChain(rootState.activeNetwork, chain).formatAddressUI(address)
    url = `${url}&walletAddress=${_address}`

    chrome.tabs.create({ url })
    dispatch('setBuyCryptoModalOpen', { open: false })
    dispatch('setBuyCryptoOverviewModalOpen', { open: false })
    dispatch('trackAnalytics', {
      event: 'Continue with Transak clicked',
      category: 'Buy Crypto',
      label: 'Buy Crypto Continue with Transak clicked'
    })
  },
  openOnramperWidgetTab: ({ dispatch, rootState }, { chain, asset, address }) => {
    const widgetUrl = process.env.VUE_APP_ONRAMPER_WIDGET_URL
    const apiKey = process.env.VUE_APP_ONRAMPER_API_KEY
    let url = `${widgetUrl}?apiKey=${apiKey}&defaultCrypto=${asset}&excludePaymentMethods=applePay`

    const _address = getChain(rootState.activeNetwork, chain).formatAddressUI(address)
    url = `${url}&wallets=${asset}:${_address}&onlyCryptos=${asset}`

    chrome.tabs.create({ url })
    dispatch('setBuyCryptoModalOpen', { open: false })
    dispatch('setBuyCryptoOverviewModalOpen', { open: false })
    dispatch('trackAnalytics', {
      event: 'Continue with OnRamper clicked',
      category: 'Buy Crypto',
      label: 'Buy Crypto Continue with OnRamper clicked'
    })
  },
  setLedgerSignRequestModalOpen: ({ commit }, { open }) => {
    commit('SET_LEDGER_SIGN_REQUEST_MODAL_OPEN', { open })
  },
  setLocalePreference: ({ commit }, { locale }) => {
    commit('SET_LOCALE', { locale })
  },
  getBrowserLocale: () => {
    const browserLang = chrome.i18n.getUILanguage()
    // we only support the locale and not the region, so we should remove it
    if (browserLang.includes('-')) {
      return browserLang.split('-')[0]
    }
    return browserLang
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
  checkAnalyticsOptIn,
  trackAnalytics
}
