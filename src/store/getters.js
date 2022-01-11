import { assets as cryptoassets, unitToCurrency } from '@liquality/cryptoassets'
import { createClient } from './factory/client'
import { createSwapProvider } from './factory/swapProvider'
import { Object } from 'core-js'
import BN from 'bignumber.js'
import { cryptoToFiat } from '@/utils/coinFormatter'
import { Networks } from '@/utils/networks'
import { uniq } from 'lodash-es'
import { getDerivationPath } from '@/utils/derivationPath'

const clientCache = {}
const swapProviderCache = {}

const TESTNET_CONTRACT_ADDRESSES = {
  DAI: '0xad6d458402f60fd3bd25163575031acdce07538d',
  SOV: '0x6a9A07972D07E58f0daF5122D11e069288A375fB',
  PWETH: '0xA6FA4fB5f76172d178d61B04b0ecd319C5d1C0aa',
  SUSHI: '0x0769fd68dFb93167989C6f7254cd0D766Fb2841F',
  ANC: 'terra1747mad58h0w4y589y3sk84r5efqdev9q4r02pc'
}
const TESTNET_ASSETS = [
  'BTC',
  'ETH',
  'RBTC',
  'DAI',
  'BNB',
  'SOV',
  'NEAR',
  'MATIC',
  'PWETH',
  'ARBETH',
  'SOL',
  'SUSHI',
  'LUNA',
  'UST',
  'ANC'
].reduce((assets, asset) => {
  return Object.assign(assets, {
    [asset]: {
      ...cryptoassets[asset],
      contractAddress: TESTNET_CONTRACT_ADDRESSES[asset]
    }
  })
}, {})

export default {
  client (state, getters) {
    return ({
      network,
      walletId,
      asset,
      accountId,
      useCache = true,
      accountType = 'default',
      accountIndex = 0
    }) => {
      const account = accountId ? getters.accountItem(accountId) : null
      const _accountType = account?.type || accountType
      const _accountIndex = account?.index || accountIndex
      const { chain } = getters.cryptoassets[asset]
      let derivationPath
      // when we ask for ledger accounts from the ledger device we don't have the derivation path
      // the !account doesn't exist in this case or if we call the getter with accountId equals to null
      if (_accountType.includes('ledger') || !account) {
        derivationPath = getDerivationPath(chain, network, _accountIndex, _accountType)
      } else {
        derivationPath = account.derivationPath
      }
      const cacheKey = [
        asset,
        chain,
        network,
        walletId,
        derivationPath,
        _accountType
      ].join('-')

      if (useCache) {
        const cachedClient = clientCache[cacheKey]
        if (cachedClient) return cachedClient
      }

      const { mnemonic } = state.wallets.find(w => w.id === walletId)
      const client = createClient(asset, network, mnemonic, _accountType, derivationPath)
      clientCache[cacheKey] = client

      return client
    }
  },
  swapProvider (state) {
    return (network, providerId) => {
      const cacheKey = [network, providerId]

      const cachedSwapProvider = swapProviderCache[cacheKey]
      if (cachedSwapProvider) return cachedSwapProvider

      const swapProvider = createSwapProvider(network, providerId)
      swapProviderCache[cacheKey] = swapProvider

      return swapProvider
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
    return accounts[activeWalletId]?.[activeNetwork]?.filter(a => a.enabled) || []
  },
  networkAssets (state) {
    const { enabledAssets, activeNetwork, activeWalletId } = state
    return enabledAssets[activeNetwork][activeWalletId]
  },
  allNetworkAssets (state) {
    return Networks.reduce((result, network) => {
      return uniq(result.concat(state.enabledAssets[network][state.activeWalletId]))
    }, [])
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
      const account = accountsData.find(a => a.id === accountId && a.enabled)
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
    const { accounts, activeNetwork, activeWalletId, enabledChains } = state
    const { accountFiatBalance, assetFiatBalance } = getters
    return accounts[activeWalletId]?.[activeNetwork]
      .filter(account => account.assets &&
              account.enabled &&
              account.assets.length > 0 &&
              enabledChains[activeWalletId]?.[activeNetwork]?.includes(account.chain)
      )
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
        if (
          a.type.includes('ledger') ||
          a.chain < b.chain
        ) {
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
  },
  chainAssets (state, getters) {
    const { cryptoassets } = getters

    const chainAssets = Object.entries(cryptoassets).reduce((chains, [asset, assetData]) => {
      const assets = assetData.chain in chains ? chains[assetData.chain] : []
      return Object.assign({}, chains, {
        [assetData.chain]: [...assets, asset]
      })
    }, {})
    return chainAssets
  },
  analyticsEnabled (state) {
    if (state.analytics && state.analytics.acceptedDate != null) {
      return true
    }
    return false
  }
}
