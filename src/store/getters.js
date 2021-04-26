import { assets as cryptoassets, unitToCurrency } from '@liquality/cryptoassets'
import { createClient } from './factory/client'
import buildConfig from '../build.config'
import { Object } from 'core-js'
import BN from 'bignumber.js'
import { cryptoToFiat } from '@/utils/coinFormatter'

const clientCache = {}

const TESTNET_CONTRACT_ADDRESSES = {
  DAI: '0xcE2748BE67fB4346654B4500c4BB0642536365FC',
  SOV: '0x6a9A07972D07E58f0daF5122D11e069288A375fB'
}
const TESTNET_ASSETS = ['BTC', 'ETH', 'RBTC', 'DAI', 'BNB', 'SOV', 'NEAR'].reduce((assets, asset) => {
  return Object.assign(assets, {
    [asset]: {
      ...cryptoassets[asset],
      contractAddress: TESTNET_CONTRACT_ADDRESSES[asset]
    }
  })
}, {})

export default {
  agentEndpoints (state) {
    return network => buildConfig.agentEndpoints[network]
  },
  client (state) {
    return (network, walletId, asset, walletType = 'default') => {
      const cacheKey = [asset, network, walletId, walletType].join('-')

      const cachedClient = clientCache[cacheKey]
      if (cachedClient) return cachedClient

      const { mnemonic } = state.wallets.find(w => w.id === walletId)
      const client = createClient(asset, network, mnemonic, walletType)
      clientCache[cacheKey] = client

      return client
    }
  },
  historyItemById (state) {
    return (network, walletId, id) => state.history[network][walletId].find(i => i.id === id)
  },
  cryptoassets (state) {
    const { activeNetwork, activeWalletId } = state

    const baseAssets = state.activeNetwork === 'testnet' ? TESTNET_ASSETS : cryptoassets

    const customAssets = state.customTokens[activeNetwork]?.[activeWalletId]?.reduce((assets, token) => {
      return Object.assign(assets, {
        [token.symbol]: {
          ...baseAssets.DAI, // Use DAI as template for custom tokens
          ...token,
          code: token.symbol
        }
      })
    }, {})

    return Object.assign({}, baseAssets, customAssets)
  },
  networkAssets (state) {
    const { enabledAssets, activeNetwork, activeWalletId } = state
    return enabledAssets[activeNetwork][activeWalletId]
  },
  orderedBalances (state, getters) {
    // const { enabledAssets, activeNetwork, activeWalletId } = state
    // const { networkWalletBalances } = getters
    // if (!networkWalletBalances) {
    //   return []
    // }
    // const assets = enabledAssets[activeNetwork][activeWalletId]
    // return Object.entries(networkWalletBalances)
    //   .filter(([asset]) => assets.includes(asset))
    //   .sort(([assetA], [assetB]) => {
    //     return assets.indexOf(assetA) - assets.indexOf(assetB)
    //   })
    return []
  },
  assetsWithBalance (_state, getters) {
    // const { orderedBalances } = getters
    // return orderedBalances.filter(([asset, balance]) => balance > 0)
    return []
  },
  activity (state) {
    const { history, activeNetwork, activeWalletId } = state
    if (!history[activeNetwork]) return []
    if (!history[activeNetwork][activeWalletId]) return []
    return history[activeNetwork][activeWalletId].slice().reverse()
  },
  totalFiatBalance (_state, getters) {
    const { accountsData } = getters
    return accountsData
      .filter(a => a.type === 'default')
      .map(a => a.totalFiatBalance)
      .reduce((accum, balance) => {
        return accum.plus(BN(balance || 0))
      }, BN(0))
  },
  accountItem (state, getters) {
    const { accountsData } = getters
    return (accountId) => {
      const account = accountsData.find(a => a.id === accountId)
      return account
    }
  },
  accountsWithBalance (state, getters) {
    const { accountsData } = getters
    return accountsData.map(account => {
      const balances = Object.entries(account.balances)
        .filter(([_, balance]) => BN(balance).gt(0))
        .reduce((accum, [asset, balance]) => {
          return {
            ...accum,
            [asset]: balance
          }
        }, {})
      return {
        ...account,
        balances
      }
    }).filter(account => account.balances && Object.keys(account.balances).length > 0)
  },
  accountsData (state, getters) {
    const { accounts, activeNetwork, activeWalletId } = state
    const { accountFiatBalance, assetFiatBalance } = getters
    return accounts[activeWalletId]?.[activeNetwork]
            .filter(account => account.assets && account.assets.length > 0)
            .map(account => {
              const totalFiatBalance = accountFiatBalance(activeWalletId, activeNetwork, account.id)
              const fiatBalances = Object.entries(account.balances)
                .reduce((accum, [asset, balance]) => {
                  const fiat = assetFiatBalance(asset, balance)
                  return {
                    ...accum,
                    [asset]: fiat
                  }
                }, {})
              return {
                ...account,
                fiatBalances,
                totalFiatBalance
              }
            }).sort((a, b) => {
              if (a.type.includes('ledger')) {
                return -1
              }

              return 0
            })
  },
  accountFiatBalance (state, getters) {
    const { accounts } = state
    const { assetFiatBalance } = getters
    return (walletId, network, accountId) => {
      const account = accounts[walletId]?.[network].find(a => a.id === accountId)
      if (account) {
        return Object.entries(account.balances)
          .reduce((accum, [asset, balance]) => {
            const fiat = assetFiatBalance(asset, balance)
            return accum.plus(fiat)
          }, BN(0))
      }
      return BN(0)
    }
  },
  assetFiatBalance (state) {
    const { fiatRates } = state
    return (asset, balance) => {
      if (fiatRates && fiatRates[asset] && balance) {
        const amount = unitToCurrency(cryptoassets[asset], balance)
        return cryptoToFiat(amount, fiatRates[asset])
      }
      return BN(0)
    }
  }
}
