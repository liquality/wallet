import store from './store'

let balanceInterval
const BALANCE_UPDATE_INTERVAL = 30000

store.subscribe(({ type, payload }, state) => {
  switch (type) {
    case 'CHANGE_ACTIVE_NETWORK':
      store.dispatch('updateBalances', { network: state.activeNetwork, walletId: state.activeWalletId })
      store.dispatch('updateMarketData', { network: state.activeNetwork })

      break

    case 'UNLOCK_WALLET':
      store.dispatch('updateBalances', { network: state.activeNetwork, walletId: state.activeWalletId })
      store.dispatch('updateMarketData', { network: state.activeNetwork })
      store.dispatch('checkPendingSwaps', { walletId: state.activeWalletId })

      if (!balanceInterval) {
        balanceInterval = setInterval(() => {
          store.dispatch('updateBalances', { network: state.activeNetwork, walletId: state.activeWalletId })
        }, BALANCE_UPDATE_INTERVAL)
      }

      break
  }
})
