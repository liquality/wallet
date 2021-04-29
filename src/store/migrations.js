import { cloneDeep } from 'lodash-es'
import buildConfig from '../build.config'
import { accountCreator, getNextAccountColor } from '@/utils/accounts'
import cryptoassets from '@/utils/cryptoassets'
import { chains } from '@liquality/cryptoassets'

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
      const walletId = state.activeWalletId
      const accounts = {
        [walletId]: {
          mainnet: [],
          testnet: []
        }
      }

      buildConfig.networks.forEach(async network => {
        const assetKeys = enabledAssets[network]?.[walletId] || []

        buildConfig.chains.forEach(async chainId => {
          const assets = assetKeys.filter(asset => {
            return cryptoassets[asset].chain === chainId
          })

          const chain = chains[chainId]

          const addresses = []

          if (state.addresses &&
            state.addresses?.[network] &&
            state.addresses?.[network]?.[walletId] &&
            state.addresses?.[network]?.[walletId]?.[chain.nativeAsset]) {
            addresses.push(state.addresses[network][walletId][chain.nativeAsset])
          }

          const _account = accountCreator(
            {
              walletId,
              account: {
                name: `${chain.name} 1`,
                chain: chainId,
                addresses,
                assets,
                balances: {},
                type: 'default',
                index: 0,
                color: getNextAccountColor(chainId, 0)
              }
            })

          accounts[walletId][network].push(_account)
        })
      })

      delete state.addresses
      delete state.balances

      // Move .network property to .chain
      const customTokens = {
        mainnet: {
          [walletId]: state.customTokens.mainnet?.[walletId]?.map(token => {
            const newCustomToken = { ...token, chain: token.network }
            delete newCustomToken.network
            return newCustomToken
          })
        },
        testnet: {
          [walletId]: state.customTokens.testnet?.[walletId]?.map(token => {
            const newCustomToken = { ...token, chain: token.network }
            delete newCustomToken.network
            return newCustomToken
          })
        }
      }

      // Remove defunct order statuses
      const history = {
        mainnet: {
          [walletId]: state.history.mainnet?.[walletId]
            ?.filer(item => !(['QUOTE', 'SECRET_READY'].includes(item.status)))
            .map(item => ['INITIATION_REPORTED', 'INITIATION_CONFIRMED'].includes(item.status) ? ({ ...item, status: 'FUNDED' }) : item)
        },
        testnet: {
          [walletId]: state.history.testnet?.[walletId]
            ?.filer(item => !(['QUOTE', 'SECRET_READY'].includes(item.status)))
            .map(item => ['INITIATION_REPORTED', 'INITIATION_CONFIRMED'].includes(item.status) ? ({ ...item, status: 'FUNDED' }) : item)
        }
      }

      return { ...state, accounts, customTokens, history }
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
