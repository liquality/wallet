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
  SET_LOCALE(state, { locale }) {
    state.locale = locale
  }
}
