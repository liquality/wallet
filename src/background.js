import 'setimmediate'
import { random } from 'lodash-es'
import store from './store'
import { wait } from './store/utils'
import cryptoassets from '@liquality/wallet-core/dist/src/utils/cryptoassets'
import { unitToCurrency } from '@liquality/cryptoassets'
import { prettyFiatBalance } from '@liquality/wallet-core/dist/src/utils/coinFormatter'
import _ from 'lodash-es'
import { version as walletVersion } from '../package.json'

let prevState = _.cloneDeep(store.state)

function asyncLoop(fn, delay) {
  return wait(delay())
    .then(() => fn())
    .then(() => asyncLoop(fn, delay))
}

function getBalance(state) {
  let total = 0
  state.accounts?.[state.activeWalletId]?.[state.activeNetwork].map((item) => {
    Object.keys(item.balances).map((key) => {
      total += total + Number(item.balances[key])
    })
  })
  return total
}

store.subscribe(({ type, payload }, state) => {
  let currentState = _.cloneDeep(state)
  const { dispatch, getters } = store

  const accountIds = store.getters.accountsData.map((account) => {
    return account.id
  })

  switch (type) {
    case 'CREATE_WALLET':
      // Analytics Opt in event (if state has acceptedData is not 0)
      if (state.analytics?.acceptedDate > 0) {
        dispatch('app/trackAnalytics', {
          event: 'User Opt-In to Analytics',
          properties: {
            category: 'Analytics'
          }
        })
      }
      // Import with seed phrase event
      if (state.wallets[0].imported) {
        dispatch('app/trackAnalytics', {
          event: 'Import with seed phrase',
          properties: {
            walletVersion,
            label: 'Import with seed phrase',
            action: 'User created wallet with import seed phrase'
          }
        })
      } else {
        // Create wallet event
        dispatch('app/trackAnalytics', {
          event: 'Create a new wallet',
          properties: {
            walletVersion,
            label: 'New wallet created',
            action: 'User created a new wallet with new seed phrase'
          }
        })
      }
      break

    case 'CHANGE_ACTIVE_NETWORK':
      dispatch('initializeAddresses', {
        network: state.activeNetwork,
        walletId: state.activeWalletId
      })
      dispatch('app/trackAnalytics', {
        event: `Change Active Network to ${state.activeNetwork}`,
        properties: {
          walletVersion,
          action: 'User changed active network',
          network: state.activeNetwork
        }
      })
      dispatch('updateBalances', {
        network: state.activeNetwork,
        walletId: state.activeWalletId
      })
      dispatch('updateNFTs', {
        walletId: state.activeWalletId,
        network: state.activeNetwork,
        accountIds: accountIds
      }),
        dispatch('updateMarketData', { network: state.activeNetwork })
      break
    case 'LOCK_WALLET':
      dispatch('app/trackAnalytics', {
        event: 'Wallet locked successfully',
        properties: {
          walletVersion,
          category: 'Lock/Unlock',
          action: 'Wallet Locked'
        }
      })
      break
    case 'UNLOCK_WALLET':
      dispatch('app/checkAnalyticsOptIn')
      dispatch('initializeAddresses', {
        network: state.activeNetwork,
        walletId: state.activeWalletId
      })
      dispatch('updateFiatRates', { assets: store.getters.allNetworkAssets })
      dispatch('updateMarketData', { network: state.activeNetwork })
      dispatch('updateCurrenciesInfo', { assets: store.getters.allNetworkAssets })
      dispatch('checkPendingActions', { walletId: state.activeWalletId })

      asyncLoop(
        () =>
          dispatch('updateNFTs', {
            walletId: state.activeWalletId,
            network: state.activeNetwork,
            accountIds: accountIds
          }),
        () => random(200000, 300000)
      )

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

      dispatch('app/trackAnalytics', {
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
      dispatch('app/trackAnalytics', {
        event: `User send funds`,
        properties: {
          walletVersion,
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
    case 'ADD_EXTERNAL_CONNECTION':
      dispatch('app/trackAnalytics', {
        event: 'Connect to Dapps',
        properties: {
          walletVersion,
          category: 'Dapps',
          action: 'Dapp Injected',
          label: `Connect to ${payload.origin} ${payload.chain}`,
          dappOrigin: `${payload.origin}`,
          chain: `${payload.chain}`
        }
      })
      break
    case 'ADD_CUSTOM_TOKEN':
      dispatch('app/trackAnalytics', {
        event: 'Custom Token Added',
        properties: {
          walletVersion,
          category: 'Settings',
          action: 'Custom Token Added',
          customTokenName: `${payload.customToken.name}`,
          customTokenChain: `${payload.customToken.chain}`,
          customTokenSymbol: `${payload.customToken.symbol}`,
          label: [
            `${payload.customToken.name}`,
            `${payload.customToken.chain}`,
            `${payload.customToken.symbol}`
          ]
        }
      })
      break
    case 'REMOVE_CUSTOM_TOKEN':
      dispatch('app/trackAnalytics', {
        event: 'Custom Token Removed',
        properties: {
          walletVersion,
          category: 'Settings',
          action: 'Custom Token Removed',
          customTokenSymbol: `${payload.symbol}`,
          label: `${payload.symbol}`
        }
      })
      break
    case 'UPDATE_HISTORY':
      // eslint-disable-next-line
      const item = getters.historyItemById(payload.network, payload.walletId, payload.id)
      if (item.type === 'SWAP' && payload.updates) {
        if (payload.updates.status !== 'undefined') {
          dispatch('app/trackAnalytics', {
            event: 'Swap status change',
            properties: {
              walletVersion,
              category: 'Swaps',
              action: 'Swap Status changed',
              swapProvider: `${item.provider}`,
              label: `${item.from} to ${item.to}`,
              swapStatus: `${payload.updates.status}`,
              orderId: `${item.orderId}`
            }
          })
        }
      }
      if (item.type === 'SEND' && payload.updates) {
        if (payload.updates.status !== 'undefined') {
          dispatch('app/trackAnalytics', {
            event: 'Send status change',
            properties: {
              walletVersion,
              category: 'Send/Receive',
              action: 'Send Status changed',
              asset: `${item.from}`,
              sendStatus: `${payload.updates.status}`
            }
          })
        }
      }
      if (item.type === 'NFT' && payload.updates) {
        if (payload.updates.status !== 'undefined') {
          dispatch('app/trackAnalytics', {
            event: 'Send NFT status change',
            properties: {
              walletVersion,
              category: 'Send NFT',
              action: 'Send NFT Status changed',
              sendStatus: `${payload.updates.status}`
            }
          })
        }
      }
      break
    case 'UPDATE_BALANCE':
      // eslint-disable-next-line no-case-declarations
      let prevBalance = getBalance(prevState)
      // eslint-disable-next-line no-case-declarations
      const newBalance = getBalance(currentState)
      // Only trigger event for the first time when user funds their wallet, any subsequent balance updates are ignored.
      if (prevBalance === 0 && newBalance > prevBalance) {
        dispatch('app/trackAnalytics', {
          event: 'User funded wallet',
          properties: {
            walletVersion,
            category: 'Balance',
            action: 'Balance Updated',
            label: 'User funded wallet'
          }
        })
      }
      prevState = currentState
      break
    case 'TOGGLE_EXPERIMENT':
      dispatch('app/trackAnalytics', {
        event: `User on Experiment feature ${payload.name}`,
        properties: {
          walletVersion,
          category: 'Experiments',
          action: 'Experiment Toggle on/off',
          label: `${payload.name}`
        }
      })
      break
    case 'CHANGE_PASSWORD':
      dispatch('app/trackAnalytics', {
        walletVersion,
        event: 'Change Password',
        properties: {
          category: 'Settings',
          action: 'Change Password'
        }
      })
      break
    case 'DISABLE_ASSETS':
      dispatch('app/trackAnalytics', {
        walletVersion,
        event: 'User Disable Asset',
        properties: {
          category: 'Settings',
          action: 'Disable Asset',
          assets: payload.assets
        }
      })
      break
    case 'DISABLE_ETHEREUM_INJECTION':
      dispatch('app/trackAnalytics', {
        walletVersion,
        event: 'User Disable Default Web3 Wallet Injection',
        properties: {
          category: 'Settings',
          action: 'Disable Default Web3 Wallet Ethereum Injection'
        }
      })
      break
    case 'ENABLE_ETHEREUM_INJECTION':
      dispatch('app/trackAnalytics', {
        walletVersion,
        event: 'User Enable Default Web3 Wallet Injection',
        properties: {
          category: 'Settings',
          action: 'Enable Default Web3 Wallet Ethereum Injection'
        }
      })
      break
  }
})
