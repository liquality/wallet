import 'setimmediate'
import { random } from 'lodash-es'
import store from './store'

let balanceInterval
let fiatRatesInterval

store.subscribe(({ type, payload }, state) => {
  switch (type) {
    case 'CHANGE_ACTIVE_NETWORK':
      store.dispatch('updateBalances', { network: state.activeNetwork, walletId: state.activeWalletId })
      store.dispatch('updateMarketData', { network: state.activeNetwork })
      break

    case 'UNLOCK_WALLET':
      store.dispatch('updateBalances', { network: state.activeNetwork, walletId: state.activeWalletId })
      store.dispatch('updateFiatRates')
      store.dispatch('updateMarketData', { network: state.activeNetwork })
      store.dispatch('checkPendingActions', { walletId: state.activeWalletId })

      if (!balanceInterval) {
        balanceInterval = setInterval(() => {
          store.dispatch('updateBalances', { network: state.activeNetwork, walletId: state.activeWalletId })
        }, random(20000, 30000))
      }

      if (!fiatRatesInterval) {
        fiatRatesInterval = setInterval(() => {
          store.dispatch('updateFiatRates')
        }, random(20000, 30000))
      }

      break
  }
})
