import 'setimmediate'
import { random } from 'lodash-es'
import store from './store'
import { wait } from './store/utils'
import amplitude from 'amplitude-js'

amplitude.getInstance().init('bf12c665d1e64601347a600f1eac729e')

function asyncLoop (fn, delay) {
  return wait(delay())
    .then(() => fn())
    .then(() => asyncLoop(fn, delay))
}

store.subscribe(async ({ type, payload }, state) => {
  switch (type) {
    case 'CHANGE_ACTIVE_NETWORK':
      store.dispatch('initializeAddresses', { network: state.activeNetwork, walletId: state.activeWalletId })
      store.dispatch('updateBalances', { network: state.activeNetwork, walletId: state.activeWalletId })
      store.dispatch('updateMarketData', { network: state.activeNetwork })

      amplitude.getInstance().logEvent('Network Changed', {
        network: state.activeNetwork,
        walletId: state.activeWalletId
      })
      break

    case 'UNLOCK_WALLET':
      amplitude.getInstance().logEvent('Unlock Wallet')

      store.dispatch('trackAnalytics', {
        event: 'Wallet Unlock',
        properties: {
          category: 'Unlock Wallet',
          action: 'Unlock Wallet',
          label: 'Unlock Wallet'
        }
      })
      store.dispatch('checkAnalyticsOptIn')
      store.dispatch('initializeAddresses', { network: state.activeNetwork, walletId: state.activeWalletId })
      store.dispatch('updateBalances', { network: state.activeNetwork, walletId: state.activeWalletId })
      store.dispatch('updateFiatRates', { assets: store.getters.allNetworkAssets })
      store.dispatch('updateMarketData', { network: state.activeNetwork })
      store.dispatch('checkPendingActions', { walletId: state.activeWalletId })

      store.commit('app/SET_USB_BRIDGE_TRANSPORT_CREATED', { created: false })
      store.commit('app/SET_USB_BRIDGE_CREATED', { created: false })

      asyncLoop(
        () => store.dispatch('updateBalances', { network: state.activeNetwork, walletId: state.activeWalletId }),
        () => random(400000, 600000)
      )

      asyncLoop(
        () => store.dispatch('updateFiatRates', { assets: Object.keys(state.fiatRates) }),
        () => random(40000, 60000)
      )

      asyncLoop(
        () => store.dispatch('updateMarketData', { network: state.activeNetwork }),
        () => random(40000, 60000)
      )

      break
  }
})
