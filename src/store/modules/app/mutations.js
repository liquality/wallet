export const mutations = {
  ANALITYCS_STARTED(state) {
    state.analyticsStarted = true
  },
  SET_ANALYTICS_OPTIN_MODAL_OPEN(state, { open }) {
    state.analyticsOptInModalOpen = open
  },
  SET_WHATS_NEW_MODAL_CONTENT(state, { content }) {
    state.whatsNewModalContent = content
  },
  SET_ORIGIN_ACCESS_ACTIVE(state, { active }) {
    state.requestOriginAccessActive = active
  },
  SET_REQUEST_PERMISSION_ACTIVE(state, { active }) {
    state.requestPermissionActive = active
  },
  SET_BUY_CRYPTO_MODAL_OPEN(state, { open, chain, asset, address }) {
    if (open) {
      state.buyCryptoModalData = { chain, asset, address }
    } else {
      state.buyCryptoModalData = {}
    }
    state.buyCryptoModalOpen = open
  },
  SET_BUY_CRYPTO_OVERVIEW_MODAL_OPEN(state, { open }) {
    state.buyCryptoOverviewModalOpen = open
  },
  SET_LEDGER_SIGN_REQUEST_MODAL_OPEN(state, { open }) {
    state.ledgertSignRequestModalOpen = open
  },
  SET_SETTINGS_MODAL_OPEN(state, { open }) {
    state.settingsModalOpen = open
  },
  SET_LOCALE(state, { locale }) {
    state.locale = locale
  },
  ADD_WALLET_CONNNECT_SESSION(state, { session }) {
    state.walletConnectSessions.push({ ...session })
  },
  REMOVE_WALLET_CONNNECT_SESSION(state, { id }) {
    const index = state.walletConnectSessions.findIndex((s) => s.id === id)
    if (index >= 0) {
      state.walletConnectSessions.splice(index, 1)
    }
  },
  ADD_WALLET_CONNNECT_SESSION_PROPOSAL(state, { session }) {
    state.walletConnectSessionsProposals.push({ ...session })
  },
  REMOVE_WALLET_CONNNECT_SESSION_PROPOSAL(state, { id }) {
    const index = state.walletConnectSessionsProposals.findIndex((s) => s.id === id)
    if (index >= 0) {
      state.walletConnectSessionsProposals.splice(index, 1)
    }
  },
  ADD_WALLET_CONNNECT_REQUEST(state, { request }) {
    state.walletConnectRequests.push({ ...request })
  },
  REMOVE_WALLET_CONNNECT_REQUEST(state, { id }) {
    const index = state.walletConnectRequests.findIndex((s) => s.id === id)
    if (index >= 0) {
      state.walletConnectRequests.splice(index, 1)
    }
  },
  SET_EXTENSION_IS_OPEN(state, { open }) {
    state.extensionIsOpen = open
  }
}
