/* global browser */
import { setLedgerBridgeListener } from '@/utils/ledger-bridge-provider'

export const actions = {
  openUSBBridgeWindow: async ({ rootState, commit }) => {
    const { usbBridgeWindowsId } = rootState
    if (usbBridgeWindowsId && usbBridgeWindowsId > 0) {
      try {
        const existingWindow = await browser.windows.get(usbBridgeWindowsId)
        if (existingWindow) {
          commit('SET_USB_BRIDGE_WINDOWS_ID', { id: 0 }, { root: true })
          await browser.windows.remove(usbBridgeWindowsId)
        }
      } catch (error) {
        console.log(error)
      }
    }

    const url = process.env.VUE_APP_LEDGER_BRIDGE_URL
    const win = await browser.windows.create(
      {
        url: `${url}#${browser.runtime.id}`,
        focused: true,
        type: 'popup',
        height: 600,
        width: 360
      }
    )
    commit('SET_USB_BRIDGE_WINDOWS_ID', { id: win.id }, { root: true })
  },
  startBridgeListener: ({ commit }) => {
    const bridgeEmiter = setLedgerBridgeListener()
    bridgeEmiter.on('LISTENER_STARTED', () => {
      console.log('USB-BRIDGE::LISTENER_STARTED')
      commit('SET_USB_BRIDGE_CREATED', { created: true })
    }).on('TRANSPORT_CREATED', () => {
      console.log('USB-BRIDGE::TRANSPORT_CREATED')
      commit('SET_USB_BRIDGE_TRANSPORT_CREATED', { created: true })
    }).on('BRIDGE_CLOSED', () => {
      console.log('USB-BRIDGE::BRIDGE_CLOSED')
      commit('SET_USB_BRIDGE_TRANSPORT_CREATED', { created: false })
      commit('SET_USB_BRIDGE_CREATED', { created: false })
    }).on('DISCONNECTED_PORT', () => {
      console.log('USB-BRIDGE::DISCONNECTED_PORT')
      commit('SET_USB_BRIDGE_TRANSPORT_CREATED', { created: false })
      commit('SET_USB_BRIDGE_CREATED', { created: false })
    })

    return bridgeEmiter
  }
}
