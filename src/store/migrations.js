import { cloneDeep } from 'lodash-es'
import buildConfig from '../build.config'
import { accountCreator, getNextAccountColor } from '@/utils/accounts'
import { chains, assets as cryptoassets } from '@liquality/cryptoassets'
import { v4 as uuidv4 } from 'uuid'
import { getLegacyRskBalance } from './utils'

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
          [state.activeWalletId]: state.customTokens?.mainnet?.[state.activeWalletId].map(token => ({ ...token, network: 'ethereum' }))
        },
        testnet: {
          [state.activeWalletId]: state.customTokens?.testnet?.[state.activeWalletId].map(token => ({ ...token, network: 'ethereum' }))
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

      buildConfig.networks.forEach(network => {
        const assetKeys = enabledAssets[network]?.[walletId] || []

        buildConfig.chains.forEach(chainId => {
          const assets = assetKeys.filter(asset => {
            return cryptoassets[asset]?.chain === chainId
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

      const migrateHistory = (state, network, walletId) => {
        return state.history[network]?.[walletId]
          // Remove defunct swap statuses
          ?.filter(item => !(['QUOTE', 'SECRET_READY'].includes(item.status)))
          // INITIATION statuses should be moved to FUNDED to prevent double funding
          .map(item => ['INITIATION_REPORTED', 'INITIATION_CONFIRMED'].includes(item.status) ? ({ ...item, status: 'FUNDED' }) : item)
          // Account ids should be assigned to swaps
          .map(item => {
            if (item.type !== 'SWAP') return item

            const fromChain = cryptoassets[item.from].chain
            const toChain = cryptoassets[item.to].chain
            const fromAccountId = accounts[walletId][network].find(account => account.chain === fromChain).id
            const toAccountId = accounts[walletId][network].find(account => account.chain === toChain).id

            return { ...item, fromAccountId, toAccountId }
          })
      }

      const history = {
        mainnet: {
          [walletId]: migrateHistory(state, 'mainnet', walletId)
        },
        testnet: {
          [walletId]: migrateHistory(state, 'testnet', walletId)
        }
      }

      return { ...state, accounts, customTokens, history }
    }
  },
  { // set useLedgerLive default to false
    version: 6,
    migrate: async (state) => {
      return { ...state, useLedgerLive: false }
    }
  },
  { // Multi provider swaps
    version: 7,
    migrate: async (state) => {
      const walletId = state.activeWalletId

      const migrateHistory = (state, network, walletId) => {
        return state.history[network]?.[walletId].map(item => item.type === 'SWAP' ? { ...item, provider: 'liquality' } : item)
      }

      const history = {
        mainnet: {
          [walletId]: migrateHistory(state, 'mainnet', walletId)
        },
        testnet: {
          [walletId]: migrateHistory(state, 'testnet', walletId)
        }
      }

      return { ...state, history }
    }
  },
  { // remove useLedgerLive
    version: 8,
    migrate: async (state) => {
      delete state.useLedgerLive
      return { ...state, usbBridgeWindowsId: 0 }
    }
  },
  { // Inject ethereum asset -> chain
    version: 9,
    migrate: async (state) => {
      const injectEthereumChain = cryptoassets[state.injectEthereumAsset]?.chain || 'ethereum'
      delete state.injectEthereumAsset

      return { ...state, injectEthereumChain }
    }
  },
  { // Analytics
    version: 10,
    migrate: async (state) => {
      const userId = uuidv4()
      return {
        ...state,
        analytics: {
          userId,
          acceptedDate: null,
          askedDate: null,
          askedTimes: 0,
          notAskAgain: false
        }
      }
    }
  },
  { // rskLegacyDerivation
    version: 11,
    migrate: async (state) => {
      if (!Object.keys(state.accounts)?.length) {
        return {
          ...state
        }
      }

      const balance = await getLegacyRskBalance(state.accounts)

      return {
        ...state,
        rskLegacyDerivation: !balance.toNumber()
      }
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
