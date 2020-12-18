import { cloneDeep } from 'lodash-es'
import buildConfig from '../build.config'

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
          [state.activeWalletId]: state.customTokens.mainnet[state.activeWalletId].map(token => ({ ...token, network: 'ethereum' }))
        }
      }
      return { ...state, customTokens }
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
        console.error(`Failed to migrate to v${migration.version}`)
        break
      }
    }
  }
  return newState
}

export { LATEST_VERSION, isMigrationNeeded, processMigrations }
