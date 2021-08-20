import { cloneDeep } from 'lodash-es'

// Migrations
import { firstMigration } from './1_first_migration'
import { setDefaultAssets } from './2_set_default_assets'
import { addNetworkCustomTokens } from './3_add_network_custom_tokens'
import { fixRSKTokenInjectedAsset } from './4_fix_rsk_token_injected_asset'
import { multipleAccountSupport } from './5_multiple_account_support'
import { useLedgerLiveDefault } from './6_use_ledger_live_default'
import { multiProviderSwaps } from './7_multi_provider_swaps'
import { removeUseLedgerLive } from './8_remove_use_ledger_live'
import { injectEthereumAssetChain } from './9_inject_ethereum_asset_chain'
import { analitycsSettings } from './10_analytics_settings'
import {
  rskLegacyDerivationPath,
  rskLegacyDerivationPathFix
} from './11_12_rsk_legacy_derivation_path'

const migrations = [
  firstMigration, // v1
  setDefaultAssets, // v2
  addNetworkCustomTokens, // v3
  fixRSKTokenInjectedAsset, // v4
  multipleAccountSupport, // v5,
  useLedgerLiveDefault, // v6
  multiProviderSwaps, // v7
  removeUseLedgerLive, // v8
  injectEthereumAssetChain, // v9
  analitycsSettings, // v10
  rskLegacyDerivationPath, // v11
  rskLegacyDerivationPathFix // v12
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
