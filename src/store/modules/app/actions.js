/* global browser */
import { setLedgerBridgeListener } from '@/utils/ledger-bridge-provider'

const closeExistingBridgeWindow = async (windowsId) => {
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
}

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
        browser.windows.update(usbBridgeWindowsId,
          {
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
      const win = await browser.windows.create(
        {
          url: `${url}?extensionId=${browser.runtime.id}`,
          focused: true,
          type: 'popup',
          height: 600,
          width: 360,
          top,
          left
        }
      )
      commit('SET_USB_BRIDGE_WINDOWS_ID', { id: win.id }, { root: true })
    }
  },
  startBridgeListener: ({ rootState, commit, dispatch }, payload) => {
    const { ledgerBridgeConnected } = rootState.app
    const bridgeClient = setLedgerBridgeListener(ledgerBridgeConnected)
    bridgeClient.onConnect(() => {
      commit('SET_LEDGER_BRIDGE_CONNECTED', { connected: true })
      if (payload && payload.onConnect) {
        payload.onConnect()
      }
    }).onDisconnect(async (error) => {
      console.error('onDisconnect ledger bridge', error)
      commit('SET_LEDGER_BRIDGE_CONNECTED', { connected: false })
      commit('SET_LEDGER_BRIDGE_TRANSPORT_CONNECTED', { connected: false })
      const { usbBridgeWindowsId } = rootState
      await closeExistingBridgeWindow(usbBridgeWindowsId)
      commit('SET_USB_BRIDGE_WINDOWS_ID', { id: 0 }, { root: true })
    }).onTransportConnect(() => {
      commit('SET_LEDGER_BRIDGE_TRANSPORT_CONNECTED', { connected: true })
      if (payload && payload.onTransportConnect) {
        payload.onTransportConnect()
      }
    }).onTransportDisconnected(() => {
      console.error('onTransportDisconnected ledger bridge')
      commit('SET_LEDGER_BRIDGE_TRANSPORT_CONNECTED', { connected: false })
    })

    dispatch('openLedgerBridgeWindow')
  },
  setAnalyticsOptInModalOpen: ({ commit }, { open }) => {
    commit('SET_ANALYTICS_OPTIN_MODAL_OPEN', { open })
  }
}
