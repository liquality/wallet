<template>
  <div class="account-container">
    <NavBar :showMenu="false">
      <span class="account-title">
        {{ $t('pages.accounts.addLedgerAccounts') }}
      </span>
    </NavBar>
    <Connect
      v-if="currentStep === 'connect'"
      :loading="loading"
      :selected-asset="selectedAsset"
      @on-connect="connect"
      @on-select-asset="setLedgerAsset"
    />
    <Unlock
      v-else-if="currentStep === 'unlock'"
      :loading="loading"
      :creating-account="creatingAccount"
      :accounts="accounts"
      :selected-accounts="selectedAccounts"
      :selected-asset="selectedAsset"
      :ledger-error="ledgerError"
      :current-page="ledgerPage"
      @on-connect="connect"
      @on-unlock="unlock"
      @on-cancel="cancel"
      @on-select-account="selectAccount"
    />
    <Completed v-else :selected-asset="selectedAsset" />
  </div>
</template>

<script>
import { mapActions, mapState, mapGetters } from 'vuex'
import NavBar from '@/components/NavBar'
import Connect from './Connect'
import Unlock from './Unlock'
import Completed from './Completed'
import { ledgerConnectMixin } from '@/utils/hardware-wallet'
import {
  LEDGER_BITCOIN_OPTIONS,
  LEDGER_OPTIONS
} from '@liquality/wallet-core/dist/src/utils/ledger'
import { getAssetIcon } from '@/utils/asset'
import cryptoassets from '@liquality/wallet-core/dist/src/utils/cryptoassets'
import { version as walletVersion } from '../../../../package.json'
import { getNextAccountColor } from '@liquality/wallet-core/dist/src/utils/accounts'
import { ChainId, getAllEvmChains } from '@liquality/cryptoassets'
import { errorToLiqualityErrorString } from '@liquality/error-parser/dist/src/utils'
import { reportLiqualityError } from '@liquality/error-parser/dist/src/reporters/index'

const LEDGER_PER_PAGE = 5

export default {
  components: {
    NavBar,
    Connect,
    Unlock,
    Completed
  },
  mixins: [ledgerConnectMixin],
  data() {
    return {
      currentStep: 'connect',
      loading: false,
      creatingAccount: false,
      selectedAsset: null,
      accounts: [],
      selectedAccounts: {},
      ledgerError: null,
      ledgerPage: 0,
      selectedWalletType: null
    }
  },
  computed: {
    ...mapState(['activeNetwork', 'activeWalletId', 'enabledAssets']),
    ...mapGetters(['networkAccounts']),
    ledgerOptions() {
      return LEDGER_OPTIONS.sort((a, b) => {
        if (a.chain === ChainId.Bitcoin) {
          return -1
        }

        if (b.chain === ChainId.Bitcoin) {
          return 1
        }

        return 0
      })
    },
    bitcoinOptions() {
      return LEDGER_BITCOIN_OPTIONS
    }
  },
  methods: {
    getAssetIcon,
    ...mapActions('app', ['trackAnalytics']),
    ...mapActions(['createAccount', 'getLedgerAccounts', 'updateAccountBalance']),
    async connect({ asset, walletType, page }) {
      this.loading = true
      // connect to ledger
      await this.trackAnalytics({
        event: 'Connect Ledger button clicked',
        properties: {
          category: 'Connect Ledger',
          asset: `${this.selectedAsset.name}`,
          chain: `${this.selectedAsset.chain}`
        }
      })
      this.selectedAsset = asset
      this.ledgerError = null
      this.accounts = []

      try {
        if (asset) {
          await this.connectLedger()

          const accountType = walletType || asset.types[0]
          let currentPage = page || 0

          if (currentPage <= 0) {
            currentPage = 1
          }
          const startingIndex = (currentPage - 1) * LEDGER_PER_PAGE
          const payload = {
            network: this.activeNetwork,
            walletId: this.activeWalletId,
            asset: asset.name,
            accountType,
            startingIndex,
            numAccounts: LEDGER_PER_PAGE
          }
          this.currentStep = 'unlock'

          const accounts = await this.getLedgerAccounts(payload)

          if (accounts && accounts.length > 0) {
            this.accounts = accounts
            this.ledgerPage = currentPage
            await this.trackAnalytics({
              event: 'Ledger connected successfully',
              properties: {
                category: 'Connect Ledger',
                asset: `${this.selectedAsset.name}`,
                chain: `${this.selectedAsset.chain}`,
                numberOfAccounts: accounts.length
              }
            })
          } else {
            this.ledgerConnected = false
            this.ledgerError = { message: this.$t('pages.accounts.onAccountsFound') }
          }
        }
      } catch (error) {
        this.ledgerError = {
          message: this.$tle(errorToLiqualityErrorString(error))
        }
        this.ledgerConnected = false
        reportLiqualityError(error)
        await this.trackAnalytics({
          event: 'HD Wallet Ledger error',
          properties: {
            category: 'Error getting accounts',
            asset: `${this.selectedAsset.name}`,
            chain: `${this.selectedAsset.chain}`,
            error: [error.name, error.message, error.stack]
          }
        })
      } finally {
        this.loading = false
      }
    },
    async unlock({ walletType }) {
      if (this.selectedAsset) {
        await this.addAccounts({ walletType })
        await this.trackAnalytics({
          event: 'Ledger account added successfully',
          properties: {
            walletVersion,
            category: 'Hardware Wallet',
            action: 'Add Ledger Account',
            label: `Asset ${this.selectedAsset.name}`
          }
        })
      }
    },
    showTokenManagement({ walletType }) {
      this.loading = false
      this.currentStep = 'token-management'
      this.selectedWalletType = walletType
    },
    async createAccounts({ assetKeys, accounts, chain, name, accountType }) {
      const assets = assetKeys.filter((asset) => {
        return cryptoassets[asset]?.chain === chain
      })

      for (const key in accounts) {
        const item = accounts[key]
        const { publicKey, chainCode, derivationPath } = item
        const index = item.index + 1

        const account = {
          name: `Ledger ${name} ${index}`,
          alias: '',
          chain,
          addresses: [item.account],
          assets,
          index: item.index,
          type: accountType,
          enabled: true,
          derivationPath,
          color: getNextAccountColor(chain, item.index),
          publicKey,
          chainCode
        }

        await this.createAccount({
          network: this.activeNetwork,
          walletId: this.activeWalletId,
          account
        })
      }
    },
    async addAccounts({ walletType }) {
      if (Object.keys(this.selectedAccounts).length > 0) {
        try {
          this.creatingAccount = true
          const { chain } = this.selectedAsset
          const assetKeys = this.enabledAssets[this.activeNetwork]?.[this.activeWalletId] || []
          const selectedAccounts = { ...this.selectedAccounts }
          const accountType = walletType || this.selectedAsset.types[0]

          if (chain === ChainId.Ethereum) {
            const evmChains = getAllEvmChains()[this.activeNetwork]
            await Promise.all(
              Object.keys(evmChains)
                .filter(
                  (k) =>
                    evmChains[k] && ![ChainId.Optimism, ChainId.Rootstock].includes(evmChains[k].id)
                )
                .map((k) => {
                  return this.createAccounts({
                    assetKeys,
                    accounts: selectedAccounts,
                    chain: evmChains[k].id,
                    name: evmChains[k].name,
                    accountType
                  })
                })
            )
          } else {
            await this.createAccounts({
              assetKeys,
              accounts: selectedAccounts,
              chain,
              name: this.selectedAsset.name,
              accountType
            })
          }

          this.creatingAccount = false
          this.currentStep = 'completed'
        } catch (error) {
          this.ledgerError = { message: this.$tle(errorToLiqualityErrorString(error)) }
          reportLiqualityError(error)
          this.creatingAccount = false
          this.trackAnalytics({
            event: 'Ledger error creating accounts',
            properties: {
              category: 'Connect Ledger',
              asset: `${this.selectedAsset.name}`,
              chain: `${this.selectedAsset.chain}`,
              error: [error.name, error.message, error.stack]
            }
          })
        }
      }
    },
    cancel() {
      this.loading = false
      this.ledgerError = null
      this.accounts = []
      this.selectedAccount = {}
      this.currentStep = 'connect'
    },
    setLedgerAsset(asset) {
      this.selectedAsset = asset
    },
    selectAccount(item) {
      if (this.selectedAccounts[[item.account]]) {
        delete this.selectedAccounts[item.account]
        this.selectedAccounts = {
          ...this.selectedAccounts
        }
      } else {
        this.selectedAccounts = {
          ...this.selectedAccounts,
          [item.account]: item
        }
      }
    }
  },
  created() {
    this.selectedAsset = this.ledgerOptions[0]
  }
}
</script>

<style lang="scss"></style>
