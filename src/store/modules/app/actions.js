export const actions = {
  setAnalyticsOptInModalOpen: ({ commit }, { open }) => {
    commit('SET_ANALYTICS_OPTIN_MODAL_OPEN', { open })
  },
  setBuyCryptoModalOpen: ({ commit }, { open, chain, asset, address }) => {
    commit('SET_BUY_CRYPTO_MODAL_OPEN', { open, chain, asset, address })
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
  },
  setLedgerSignRequestModalOpen: ({ commit }, { open }) => {
    commit('SET_LEDGER_SIGN_REQUEST_MODAL_OPEN', { open })
  },
  settingsModalOpen: ({ commit }, isOpen) => {
    commit('SET_SETTINGS_MODAL_OPEN', isOpen)
  }
}
