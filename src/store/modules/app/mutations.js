export const mutations = {
  SET_USB_BRIDGE_CREATED (state, { created }) {
    state.usbBridgeCreated = created
  },
  SET_USB_BRIDGE_TRANSPORT_CREATED (state, { created }) {
    state.usbBridgeTransportCreated = created
  },
  ANALITYCS_STARTED (state) {
    state.analyticsStarted = true
  },
  SET_ANALYTICS_OPTIN_MODAL_OPEN (state, { open }) {
    state.analyticsOptInModalOpen = open
  },
  SET_ORIGIN_ACCESS_ACTIVE (state, { active }) {
    state.requestOriginAccessActive = active
  },
  SET_REQUEST_PERMISSION_ACTIVE (state, { active }) {
    state.requestPermissionActive = active
  }
}
