import 'setimmediate'
import { random } from 'lodash-es'
import store from './store'
import { wait } from './store/utils'

function asyncLoop (fn, delay) {
  return wait(delay())
    .then(() => fn())
    .then(() => asyncLoop(fn, delay))
}

store.subscribe(async ({ type, payload }, state) => {
  switch (type) {
    case 'CHANGE_ACTIVE_NETWORK':
      await store.dispatch('updateBalances', { network: state.activeNetwork, walletId: state.activeWalletId })
      await store.dispatch('updateMarketData', { network: state.activeNetwork })
      break

    case 'UNLOCK_WALLET':
      await store.dispatch('updateBalances', { network: state.activeNetwork, walletId: state.activeWalletId })
      await store.dispatch('updateFiatRates')
      await store.dispatch('updateMarketData', { network: state.activeNetwork })
      await store.dispatch('checkPendingActions', { walletId: state.activeWalletId })

      asyncLoop(
        () => store.dispatch('updateBalances', { network: state.activeNetwork, walletId: state.activeWalletId }),
        () => random(400000, 600000)
      )

      asyncLoop(
        () => store.dispatch('updateFiatRates'),
        () => random(400000, 600000)
      )

      asyncLoop(
        () => store.dispatch('updateMarketData', { network: state.activeNetwork }),
        () => random(400000, 600000)
      )

      break
  }
})
