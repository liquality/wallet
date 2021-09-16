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
  const { dispatch, commit, getters } = store
  switch (type) {
    case 'CHANGE_ACTIVE_NETWORK':
      dispatch('initializeAddresses', {
        network: state.activeNetwork,
        walletId: state.activeWalletId
      })
      dispatch('updateBalances', {
        network: state.activeNetwork,
        walletId: state.activeWalletId
      })
      dispatch('updateMarketData', { network: state.activeNetwork })

      dispatch('trackAnalytics', {
        event: `Network Changed ${payload.currentNetwork} to ${payload.network}`
      })
      break

    case 'UNLOCK_WALLET':
      dispatch('trackAnalytics', {
        event: 'Unlock wallet',
        properties: {
          category: 'Lock/Unlock',
          action: 'Wallet Unlocked'
        }
      })
      dispatch('checkAnalyticsOptIn')
      dispatch('initializeAddresses', {
        network: state.activeNetwork,
        walletId: state.activeWalletId
      })
      dispatch('updateBalances', {
        network: state.activeNetwork,
        walletId: state.activeWalletId
      })
      dispatch('updateFiatRates', { assets: store.getters.allNetworkAssets })
      dispatch('updateMarketData', { network: state.activeNetwork })
      dispatch('checkPendingActions', { walletId: state.activeWalletId })

      commit('app/SET_USB_BRIDGE_TRANSPORT_CREATED', { created: false })
      commit('app/SET_USB_BRIDGE_CREATED', { created: false })

      asyncLoop(
        () => dispatch('updateBalances', {
          network: state.activeNetwork,
          walletId: state.activeWalletId
        }),
        () => random(400000, 600000)
      )

      asyncLoop(
        () => dispatch('updateFiatRates', { assets: Object.keys(state.fiatRates) }),
        () => random(40000, 60000)
      )

      asyncLoop(
        () => dispatch('updateMarketData', { network: state.activeNetwork }),
        () => random(40000, 60000)
      )
      break
    case 'NEW_SWAP':
      dispatch('trackAnalytics', {
        event: 'New SWAP',
        properties: {
          category: 'Swaps',
          action: 'Swap Initiated',
          label: [`Swap ${payload.swap.from} to ${payload.swap.to}`,
                  `${payload.swap.provider}`,
                  `with fee: ${payload.feeLabel} and claim fee: ${payload.claimFeeLabel}`]
        }
      })
      break

    case 'NEW_TRASACTION':
      dispatch('trackAnalytics', {
        event: 'Send',
        properties: {
          category: 'Send/Receive',
          action: 'Funds sent',
          label: [`Send ${payload.transaction.from}`,
            `fee: ${payload.feeLabel}`]
        }
      })
      break

    case 'LOCK_WALLET':
      dispatch('trackAnalytics', {
        event: 'Wallet Lock',
        properties: {
          category: 'Lock/Unlock',
          action: 'Wallet Locked'
        }
      })
      break

    case 'ADD_EXTERNAL_CONNECTION':
      dispatch('trackAnalytics', {
        event: 'Connect to Dapps',
        properties: {
          category: 'Dapps',
          action: 'Dapp Injected',
          label: `Connect to ${payload.origin} (${payload.chain})`
        }
      })
      break
    case 'ADD_CUSTOM_TOKEN':
      dispatch('trackAnalytics', {
        event: 'Custom Token Added',
        properties: {
          category: 'Settings',
          action: 'Custom Token Added',
          label: [`${payload.customToken.name}`, `(${payload.customToken.chain})`, `(${payload.customToken.symbol})`]
        }
      })
      break
    case 'UPDATE_HISTORY':
      // eslint-disable-next-line
      const item = getters.historyItemById(payload.network, payload.walletId, payload.id)
      if (item.type === 'SWAP' && payload.updates) {
        dispatch('trackAnalytics', {
          event: `Swap status change ${payload.updates.status}`,
          properties: {
            category: 'Swaps',
            action: `Swap ${payload.updates.status}`,
            label: `${item.from} to ${item.to}`
          }
        })
      }
      if (item.type === 'SEND' && payload.updates) {
        dispatch('trackAnalytics', {
          event: `Send status change ${payload.updates.status}`,
          properties: {
            category: 'Send/Receive',
            action: `Send ${payload.updates.status}`,
            label: `${item.from} send status ${payload.updates.status} `
          }
        })
      }
      break
    case 'SETUP_WALLET':
      dispatch('trackAnalytics', {
        event: 'Onboarding',
        properties: {
          category: 'Onboarding',
          action: 'User Onboarded'
        }
      })
      break
  }
})
