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
  openUSBBridgeWindow: async ({ rootState, commit }) => {
    const { usbBridgeWindowsId } = rootState
    let existingWindow = null
    if (usbBridgeWindowsId && usbBridgeWindowsId > 0) {
      try {
        existingWindow = await browser.windows.get(usbBridgeWindowsId)
        browser.windows.update(usbBridgeWindowsId, { focused: true })
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
          width: 360
        }
      )
      commit('SET_USB_BRIDGE_WINDOWS_ID', { id: win.id }, { root: true })
    }
  },
  startBridgeListener: ({ rootState, commit }, payload) => {
    const bridgeClient = setLedgerBridgeListener()
    console.log('bridgeClient')
    bridgeClient.onConnect(() => {
      commit('SET_USB_BRIDGE_CREATED', { created: true })
    }).onTransportCreated(() => {
      commit('SET_USB_BRIDGE_TRANSPORT_CREATED', { created: true })
      if (payload && payload.onTransportCreated) {
        payload.onTransportCreated()
      }
    }).onTransportDisconnected(() => {
      commit('SET_USB_BRIDGE_TRANSPORT_CREATED', { created: false })
    }).onDisconnect(async (error) => {
      console.error('onDisconnect ledger bridge', error)
      commit('SET_USB_BRIDGE_CREATED', { created: false })
      commit('SET_USB_BRIDGE_TRANSPORT_CREATED', { created: false })
      const { usbBridgeWindowsId } = rootState
      await closeExistingBridgeWindow(usbBridgeWindowsId)
      commit('SET_USB_BRIDGE_WINDOWS_ID', { id: 0 }, { root: true })
    })
  },
  setAnalyticsOptInModalOpen: ({ commit }, { open }) => {
    commit('SET_ANALYTICS_OPTIN_MODAL_OPEN', { open })
  }
}
