import 'setimmediate'
import { random } from 'lodash-es'
import store from './store'
import { wait } from './store/utils'

function asyncLoop (fn, delay) {
  return wait(delay())
    .then(() => fn())
    .then(() => asyncLoop(fn, delay))
}

store.subscribe(async ({
  type,
  payload
}, state) => {
  switch (type) {
    case 'CHANGE_ACTIVE_NETWORK':
      store.dispatch('initializeAddresses', {
        network: state.activeNetwork,
        walletId: state.activeWalletId
      })
      store.dispatch('updateBalances', {
        network: state.activeNetwork,
        walletId: state.activeWalletId
      })
      store.dispatch('updateMarketData', { network: state.activeNetwork })

      store.dispatch('trackAnalytics', {
        event: `Network Changed ${payload.currentNetwork} to ${payload.network}`
      })
      break

    case 'UNLOCK_WALLET':
      store.dispatch('trackAnalytics', {
        event: 'Unlock wallet',
        properties: {
          category: 'Lock/Unlock',
          action: 'Wallet Unlocked'
        }
      })
      store.dispatch('checkAnalyticsOptIn')
      store.dispatch('initializeAddresses', {
        network: state.activeNetwork,
        walletId: state.activeWalletId
      })
      store.dispatch('updateBalances', {
        network: state.activeNetwork,
        walletId: state.activeWalletId
      })
      store.dispatch('updateFiatRates', { assets: store.getters.allNetworkAssets })
      store.dispatch('updateMarketData', { network: state.activeNetwork })
      store.dispatch('checkPendingActions', { walletId: state.activeWalletId })

      store.commit('app/SET_USB_BRIDGE_TRANSPORT_CREATED', { created: false })
      store.commit('app/SET_USB_BRIDGE_CREATED', { created: false })

      asyncLoop(
        () => store.dispatch('updateBalances', {
          network: state.activeNetwork,
          walletId: state.activeWalletId
        }),
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
    case 'NEW_SWAP':

      store.dispatch('trackAnalytics', {
        event: 'New SWAP',
        properties: {
          category: 'Swaps',
          action: 'Swap Initiated',
          label: `Swap ${payload.swap.from} to ${payload.swap.to} (${payload.swap.provider})`
        }
      })

      break

    case 'NEW_TRASACTION':

      store.dispatch('trackAnalytics', {
        event: 'Send',
        properties: {
          action: 'Funds sent',
          label: `Send ${payload.transaction.from}`
        }
      })

      break

    case 'LOCK_WALLET':
      store.dispatch('trackAnalytics', {
        event: 'Wallet Lock',
        properties: {
          category: 'Lock/Unlock',
          action: 'Wallet Locked'
        }
      })
      break

    case 'ADD_EXTERNAL_CONNECTION':
      store.dispatch('trackAnalytics', {
        event: 'Connect to Dapps',
        properties: {
          category: 'Dapps',
          action: 'Dapp Injected',
          label: `Connect to ${payload.origin} (${payload.chain})`
        }
      })
      break
    case 'ADD_CUSTOM_TOKEN':
      store.dispatch('trackAnalytics', {
        event: 'Custom Token Added',
        properties: {
          category: 'Settings',
          action: 'Custom Token Added',
          label: `${payload.customToken.name} (${payload.customToken.chain}) (${payload.customToken.symbol})`
        }
      })
      break
  }
})
