import { createBridgeClient } from '@/utils/ledger-bridge-provider'
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
  openLedgerBridgeWindow: async ({ rootState, commit }) => {
    const { usbBridgeWindowsId } = rootState
    let existingWindow = null
    const win = await browser.windows.getCurrent()
    const top = win.top + 50
    const left = win.left + 40

    if (usbBridgeWindowsId && usbBridgeWindowsId > 0) {
      try {
        existingWindow = await browser.windows.get(usbBridgeWindowsId)
        browser.windows.update(usbBridgeWindowsId, {
          focused: true,
          height: 600,
          width: 360,
          top,
          left
        })
      } catch (error) {
        console.log(error)
      }
    }

    if (!existingWindow) {
      const url = process.env.VUE_APP_LEDGER_BRIDGE_URL
      const win = await browser.windows.create({
        url: `${url}?extensionId=${browser.runtime.id}`,
        focused: true,
        type: 'popup',
        height: 600,
        width: 360,
        top,
        left
      })
      commit('SET_USB_BRIDGE_WINDOWS_ID', { id: win.id }, { root: true })
    }
  },
  closeExistingBridgeWindow: async ({ windowsId }) => {
    if (windowsId && windowsId > 0) {
      try {
        const existingWindow = await browser.windows.get(windowsId)
        if (existingWindow) {
          await browser.windows.remove(windowsId)
        }
      } catch (error) {
        console.log(error)
      }
    }
  },
  setLedgerBridgeConnected: ({ commit }, { connected }) => {
    commit('SET_LEDGER_BRIDGE_CONNECTED', { connected })
  },
  setLedgerBridgeTransportConnected: ({ commit }, { connected }) => {
    commit('SET_LEDGER_BRIDGE_TRANSPORT_CONNECTED', { connected })
  },
  startBridgeListener: ({ dispatch }, payload) => {
    createBridgeClient(payload)
    dispatch('openLedgerBridgeWindow')
  },
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
    let url = `${widgetUrl}?apiKey=${apiKey}`
    if (asset) {
      url = `${url}&cryptoCurrencyCode=${asset}`
    }

    if (address) {
      url = `${url}&walletAddress=${address}`
    }

    chrome.tabs.create({ url })
    dispatch('setBuyCryptoModalOpen', { open: false })
    dispatch('setBuyCryptoOverviewModalOpen', { open: false })
    dispatch(
      'trackAnalytics',
      {
        event: 'buy_crypto_modal_close',
        chain: chain,
        asset: asset,
        address: address
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
