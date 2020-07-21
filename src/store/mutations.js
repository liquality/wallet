import Vue from 'vue'

const ensureNetworkWalletTree = (ref, network, walletId, initialValue) => {
  if (!ref[network]) Vue.set(ref, network, {})
  if (!ref[network][walletId]) Vue.set(ref[network], walletId, initialValue)
}

export default {
  SETUP_WALLET (state, { key }) {
    state.key = key
    state.keyUpdatedAt = Date.now()
    state.setupAt = Date.now()
  },
  CREATE_WALLET (state, { encryptedWallets, wallet }) {
    state.encryptedWallets = encryptedWallets
    state.wallets = [wallet]
  },
  ACCEPT_TNC (state) {
    state.termsAcceptedAt = Date.now()
  },
  CHANGE_ACTIVE_WALLETID (state, { walletId }) {
    state.activeWalletId = walletId
  },
  CHANGE_ACTIVE_NETWORK (state, { network }) {
    state.activeNetwork = network
  },
  CHANGE_PASSWORD (state, { key, encryptedWallets }) {
    state.key = key
    state.encryptedWallets = encryptedWallets
    state.keyUpdatedAt = Date.now()
  },
  LOCK_WALLET (state) {
    state.key = null
    state.unlockedAt = null
    state.wallets = null
  },
  UNLOCK_WALLET (state, { key, wallets, unlockedAt }) {
    state.key = key
    state.wallets = wallets
    state.unlockedAt = unlockedAt
  },
  NEW_ORDER (state, { network, walletId, order }) {
    ensureNetworkWalletTree(state.history, network, walletId, [])

    state.history[network][walletId].push(order)
  },
  NEW_TRASACTION (state, { network, walletId, transaction }) {
    ensureNetworkWalletTree(state.history, network, walletId, [])

    state.history[network][walletId].push(transaction)
  },
  UPDATE_HISTORY (state, { network, walletId, id, updates }) {
    const item = state.history[network][walletId].find(i => i.id === id)
    Object.assign(item, updates)
  },
  REMOVE_ORDER (state, { network, walletId, id }) {
    Vue.set(state.history[network], walletId, state.history[network][walletId].filter(i => i.id !== id))
  },
  UPDATE_UNUSED_ADDRESS (state, { network, walletId, asset, address }) {
    ensureNetworkWalletTree(state.addresses, network, walletId, {})

    Vue.set(state.addresses[network][walletId], asset, address)
  },
  UPDATE_BALANCE (state, { network, walletId, asset, balance }) {
    ensureNetworkWalletTree(state.balances, network, walletId, {})

    Vue.set(state.balances[network][walletId], asset, balance)
  },
  UPDATE_FEES (state, { network, walletId, asset, fees }) {
    ensureNetworkWalletTree(state.fees, network, walletId, {})

    Vue.set(state.fees[network][walletId], asset, fees)
  },
  UPDATE_MARKET_DATA (state, { network, marketData }) {
    Vue.set(state.marketData, network, marketData)
  }
}
