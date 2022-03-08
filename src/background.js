import 'setimmediate'
import { random } from 'lodash-es'
import store from './store'
import { wait } from './store/utils'
import cryptoassets from '@/utils/cryptoassets'
import { unitToCurrency } from '@liquality/cryptoassets'
import { prettyFiatBalance } from '@/utils/coinFormatter'

function asyncLoop(fn, delay) {
  return wait(delay())
    .then(() => fn())
    .then(() => asyncLoop(fn, delay))
}

store.subscribe(async ({ type, payload }, state) => {
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
        () =>
          dispatch('updateBalances', {
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
      // eslint-disable-next-line no-case-declarations
      let fromAmountValue = unitToCurrency(cryptoassets[payload.swap.from], payload.swap.fromAmount)
      // eslint-disable-next-line no-case-declarations
      let toAmountValue = unitToCurrency(cryptoassets[payload.swap.to], payload.swap.toAmount)

      dispatch('trackAnalytics', {
        event: 'New SWAP',
        properties: {
          category: 'Swaps',
          action: 'Swap Initiated',
          swapFrom: `${payload.swap.from}`,
          swapTo: `${payload.swap.to}`,
          swapProvider: `${payload.swap.provider}`,
          fromAmount: fromAmountValue,
          toAmount: toAmountValue,
          fromAmountFiat: prettyFiatBalance(fromAmountValue, state.fiatRates[payload.swap.from]),
          toAmountFiat: prettyFiatBalance(toAmountValue, state.fiatRates[payload.swap.to])
        }
      })
      break
    case 'NEW_TRASACTION':
      // eslint-disable-next-line no-case-declarations
      const itemDetails = getters.accountItem(payload.transaction.accountId)
      // eslint-disable-next-line no-case-declarations
      const sendValue = unitToCurrency(
        cryptoassets[payload.transaction.from],
        payload.transaction.amount
      )
      dispatch('trackAnalytics', {
        event: 'Send',
        properties: {
          category: 'Send/Receive',
          action: 'Funds sent',
          fiatRate: prettyFiatBalance(sendValue, state.fiatRates[payload.transaction.from]),
          fromAsset: cryptoassets[payload.transaction.from],
          toAsset: cryptoassets[payload.transaction.to],
          fee: `${payload.feeLabel}`,
          typeOfAccount: itemDetails.type,
          nameOfAccount: itemDetails.name
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
          label: [
            `${payload.customToken.name}`,
            `(${payload.customToken.chain})`,
            `(${payload.customToken.symbol})`
          ]
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
      const item = getters.historyItemById(payload.network, payload.walletId, payload.id);
      if (item.type === 'SWAP' && payload.updates) {
        if (payload.updates.status !== 'undefined') {
          dispatch('trackAnalytics', {
            event: 'Swap status change',
            properties: {
              category: 'Swaps',
              action: 'Swap Status changed',
              swapProvider: `${item.provider}`,
              label: `${item.from} to ${item.to}`,
              swapStatus: `${payload.updates.status}`
            }
          })
        }
      }
      if (item.type === 'SEND' && payload.updates) {
        if (payload.updates.status !== 'undefined') {
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
