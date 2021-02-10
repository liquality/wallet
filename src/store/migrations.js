import { cloneDeep } from 'lodash-es'
import buildConfig from '../build.config'
import { accountCreator } from '@/utils/accounts'
import { getChainFromAsset } from '@/utils/asset'

const migrations = [
  { // Merely sets up the version
    version: 1,
    migrate: async (state) => {
      return { ...state }
    }
  },
  { // Set the default assets
    version: 2,
    migrate: async (state) => {
      const enabledAssets = {
        mainnet: {
          [state.activeWalletId]: buildConfig.defaultAssets.mainnet
        },
        testnet: {
          [state.activeWalletId]: buildConfig.defaultAssets.testnet
        }
      }
      return { ...state, enabledAssets }
    }
  },
  { // Add network to custom tokens
    version: 3,
    migrate: async (state) => {
      const customTokens = {
        mainnet: {
          [state.activeWalletId]: state.customTokens.mainnet[state.activeWalletId].map(token => ({ ...token, network: 'ethereum' }))
        },
        testnet: {
          [state.activeWalletId]: state.customTokens.testnet[state.activeWalletId].map(token => ({ ...token, network: 'ethereum' }))
        }
      }
      return { ...state, customTokens }
    }
  },
  { // Fix for RSK token injected asset
    version: 4,
    migrate: async (state) => {
      if (state.injectEthereumAsset === 'RSK') {
        const injectEthereumAsset = 'RBTC'
        return { ...state, injectEthereumAsset }
      }

      return { ...state }
    }
  },
  { // multiple account support
    version: 5,
    migrate: async (state) => {
      const { enabledAssets } = state
      const networks = ['mainnet', 'testnet']
      const chains = ['BTC', 'ETH', 'RBTC']
      const walletId = state.activeWalletId
      const accounts = {
        [walletId]: {
          mainnet: [],
          testnet: []
        }
      }

      networks.forEach(async network => {
        const assetKeys = enabledAssets[network]?.[walletId] || []

        chains.forEach(async chain => {
          const assets = assetKeys.filter(asset => {
            const assetChain = getChainFromAsset(asset)
            return assetChain === chain
          })

          const addresses = []

          if (state.addresses?.[network] &&
            state.addresses?.[network]?.[walletId] &&
            state.addresses?.[network]?.[walletId]?.[chain]) {
            addresses.push(state.addresses[network][walletId][chain])
          }

          const _account = accountCreator(
            {
              walletId,
              account: {
                name: `${chain} 1`,
                chain,
                addresses,
                assets,
                balances: {},
                type: 'default'
              }
            })

          accounts[walletId][network].push(_account)
        })
      })

      delete state.addresses
      delete state.balances
      return { ...state, accounts }
    }
  }
]

const LATEST_VERSION = migrations[migrations.length - 1].version

function isMigrationNeeded (state) {
  const currentVersion = state.version || 0
  return currentVersion < LATEST_VERSION
}

async function processMigrations (state) {
  const currentVersion = state.version || 0

  let newState = cloneDeep(state)
  for (const migration of migrations) {
    if (currentVersion < migration.version) {
      try {
        newState = await migration.migrate(cloneDeep(state))
        newState.version = migration.version
      } catch (e) {
        console.error(`Failed to migrate to v${migration.version}`, e)
        break
      }
    }
  }
  return newState
}

export { LATEST_VERSION, isMigrationNeeded, processMigrations }
