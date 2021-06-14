import { assets as cryptoassets, unitToCurrency } from '@liquality/cryptoassets'
import { createClient } from './factory/client'
import { Object } from 'core-js'
import BN from 'bignumber.js'
import { cryptoToFiat } from '@/utils/coinFormatter'

const clientCache = {}

const TESTNET_CONTRACT_ADDRESSES = {
  DAI: '0xc7ad46e0b8a400bb3c915120d284aafba8fc4735',
  SOV: '0x6a9A07972D07E58f0daF5122D11e069288A375fB',
  PWETH: '0xA6FA4fB5f76172d178d61B04b0ecd319C5d1C0aa'
}
const TESTNET_ASSETS = ['BTC', 'ETH', 'RBTC', 'DAI', 'BNB', 'SOV', 'NEAR', 'POLYGON', 'PWETH'].reduce((assets, asset) => {
  return Object.assign(assets, {
    [asset]: {
      ...cryptoassets[asset],
      contractAddress: TESTNET_CONTRACT_ADDRESSES[asset]
    }
  })
}, {})

export default {
  client (state) {
    return (network, walletId, asset, walletType = 'default', indexPath = 0) => {
      const cacheKey = [asset, network, walletId, walletType, indexPath].join('-')

      const cachedClient = clientCache[cacheKey]
      if (cachedClient) return cachedClient

      const { mnemonic } = state.wallets.find(w => w.id === walletId)
      const client = createClient(asset, network, mnemonic, walletType, indexPath)
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
  networkAccounts (state) {
    const { activeNetwork, activeWalletId, accounts } = state
    return accounts[activeWalletId]?.[activeNetwork] || []
  },
  networkAssets (state) {
    const { enabledAssets, activeNetwork, activeWalletId } = state
    return enabledAssets[activeNetwork][activeWalletId]
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
            return accum.plus(fiat || 0)
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
      return null
    }
  }
}
