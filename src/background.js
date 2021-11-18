import 'setimmediate'
import { random } from 'lodash-es'
import store from './store'
import { wait } from './store/utils'
import cryptoassets from '@/utils/cryptoassets'

function asyncLoop (fn, delay) {
  return wait(delay())
    .then(() => fn())
    .then(() => asyncLoop(fn, delay))
}

store.subscribe(async ({
  type,
  payload
}, state) => {
  const { dispatch, getters } = store
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
          from: `Swap from ${payload.swap.from}`,
          swapFrom: `${payload.swap.from}`,
          to: `Swap to ${payload.swap.to}`,
          swapTo: `${payload.swap.to}`,
          fromAddress: `${payload.swap.fromAddress}`,
          toAddress: `${payload.swap.toAddress}`,
          swapProvider: `${payload.swap.provider}`,
          fee: `${payload.feeLabel}`,
          claimFee: `${payload.claimFeeLabel}`
        }
      })
      break
    case 'NEW_TRASACTION':
      dispatch('trackAnalytics', {
        event: 'Send',
        properties: {
          category: 'Send/Receive',
          action: 'Funds sent',
          fromAsset: cryptoassets[payload.transaction.from],
          toAsset: cryptoassets[payload.transaction.to],
          fee: `${payload.feeLabel}`
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
          label: `Connect to ${payload.origin} (${payload.chain})`,
          dappOrigin: `${payload.origin}`,
          chain: `${payload.chain}`
        }
      })
      break
    case 'ADD_CUSTOM_TOKEN':
      dispatch('trackAnalytics', {
        event: 'Custom Token Added',
        properties: {
          category: 'Settings',
          action: 'Custom Token Added',
          customTokenName: `${payload.customToken.name}`,
          customTokenChain: `${payload.customToken.chain}`,
          customTokenSymbol: `${payload.customToken.symbol}`,
          label: [`${payload.customToken.name}`, `(${payload.customToken.chain})`, `(${payload.customToken.symbol})`]
        }
      })
      break
    case 'REMOVE_CUSTOM_TOKEN':
      dispatch('trackAnalytics', {
        event: 'Custom Token Removed',
        properties: {
          category: 'Settings',
          action: 'Custom Token Removed',
          customTokenName: `${payload.customToken.name}`,
          customTokenChain: `${payload.customToken.chain}`,
          customTokenSymbol: `${payload.customToken.symbol}`,
          label: `${payload.customToken.symbol})`
        }
      })
      break
    case 'UPDATE_HISTORY':
      // eslint-disable-next-line
      const item = getters.historyItemById(payload.network, payload.walletId, payload.id)
      if (item.type === 'SWAP' && payload.updates) {
        dispatch('trackAnalytics', {
          event: 'Swap status change',
          properties: {
            category: 'Swaps',
            action: 'Swap Status changed',
            label: `${item.from} to ${item.to}`,
            swapStatus: `${payload.updates.status}`
          }
        })
      }
      if (item.type === 'SEND' && payload.updates) {
        dispatch('trackAnalytics', {
          event: 'Send status change',
          properties: {
            category: 'Send/Receive',
            action: 'Send Status changed',
            asset: `${item.from}`,
            sendStatus: `${payload.updates.status}`
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
    case 'UPDATE_BALANCE':
      if (payload.balance > 0) {
        dispatch('trackAnalytics', {
          event: 'Hold Asset',
          properties: {
            category: 'Hold Asset',
            action: 'Hold asset greater than 0',
            asset: `${payload.asset}`
          }
        })
      }
      break
  }
})
