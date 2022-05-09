<template>
  <div class="account-container">
    <NavBar :showMenu="false">
      <span class="account-title"> Add Ledger Accounts </span>
    </NavBar>
    <Connect
      v-if="currentStep === 'connect'"
      :loading="loading"
      :selected-asset="selectedAsset"
      @on-connect="tryToConnect"
      @on-select-asset="setLedgerAsset"
    />
    <Unlock
      v-else
      :loading="loading"
      :creating-account="creatingAccount"
      :accounts="accounts"
      :selected-accounts="selectedAccounts"
      :selected-asset="selectedAsset"
      :ledger-error="ledgerError"
      :current-page="ledgerPage"
      @on-connect="tryToConnect"
      @on-unlock="unlock"
      @on-cancel="cancel"
      @on-select-account="selectAccount"
    />
    <LedgerBridgeModal :open="bridgeModalOpen" @close="closeBridgeModal" />
  </div>
</template>

<script>
import { mapActions, mapState, mapGetters } from 'vuex'
import NavBar from '@/components/NavBar'
import Connect from './Connect'
import Unlock from './Unlock'
import { createConnectSubscription } from '@/utils/ledger-bridge-provider'
import { LEDGER_BITCOIN_OPTIONS, LEDGER_OPTIONS } from '@liquality/wallet-core/dist/utils/ledger'
import { getAssetIcon } from '@/utils/asset'
import cryptoassets from '@liquality/wallet-core/dist/utils/cryptoassets'
import { getNextAccountColor } from '@liquality/wallet-core/dist/utils/accounts'
import LedgerBridgeModal from '@/components/LedgerBridgeModal'

const LEDGER_PER_PAGE = 5

export default {
  components: {
    NavBar,
    Connect,
    Unlock,
    LedgerBridgeModal
  },
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
      selectedWalletType: null,
      bridgeModalOpen: false
    }
  },
  computed: {
    ...mapState(['activeNetwork', 'activeWalletId', 'enabledAssets']),
    ...mapGetters(['networkAccounts']),
    ...mapGetters('app', ['ledgerBridgeReady']),
    ledgerOptions() {
      return LEDGER_OPTIONS
    },
    bitcoinOptions() {
      return LEDGER_BITCOIN_OPTIONS
    }
  },
  methods: {
    getAssetIcon,
    closeBridgeModal() {
      this.loading = false
      this.bridgeModalOpen = false
    },
    ...mapActions(['createAccount', 'getLedgerAccounts', 'updateAccountBalance', 'trackAnalytics']),
    ...mapActions('app', ['startBridgeListener']),
    async tryToConnect({ asset, walletType, page }) {
      if (this.ledgerBridgeReady) {
        await this.connect({ asset, walletType, page })
      } else {
        this.loading = true
        this.bridgeModalOpen = true
        await this.startBridgeListener()
        createConnectSubscription(() => {
          this.bridgeModalOpen = false
          this.connect({ asset, walletType, page })
        })
      }
    },
    async connect({ asset, walletType, page }) {
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
      this.loading = true
      this.ledgerError = null
      this.accounts = []

      try {
        if (asset) {
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
            this.ledgerError = { message: 'No accounts found' }
          }
        }
        this.loading = false
      } catch (error) {
        this.ledgerError = {
          message: error.message || 'Error getting accounts'
        }
        console.error('error getting accounts', error)
        await this.trackAnalytics({
          event: 'HD Wallet Ledger error',
          properties: {
            category: 'Error getting accounts',
            asset: `${this.selectedAsset.name}`,
            chain: `${this.selectedAsset.chain}`,
            error: [error.name, error.message, error.stack]
          }
        })
        this.loading = false
      }
    },
    async unlock({ walletType }) {
      if (this.selectedAsset) {
        await this.addAccounts({ walletType })
        await this.trackAnalytics({
          event: 'Ledger account added successfully',
          properties: {
            category: 'Connect Ledger',
            asset: `${this.selectedAsset.name}`,
            chain: `${this.selectedAsset.chain}`
          }
        })
      }
    },
    showTokenManagement({ walletType }) {
      this.loading = false
      this.currentStep = 'token-management'
      this.selectedWalletType = walletType
    },
    async addAccounts({ walletType }) {
      if (Object.keys(this.selectedAccounts).length > 0) {
        try {
          this.creatingAccount = true
          const { chain } = this.selectedAsset
          const assetKeys = this.enabledAssets[this.activeNetwork]?.[this.activeWalletId] || []

          const assets = assetKeys.filter((asset) => {
            return cryptoassets[asset].chain === this.selectedAsset.chain
          })

          const selectedAccounts = { ...this.selectedAccounts }
          for (const key in selectedAccounts) {
            const item = selectedAccounts[key]
            const { publicKey, chainCode, derivationPath } = item
            const index = item.index + 1
            const { address } = item.account

            const account = {
              name: `Ledger ${this.selectedAsset.name} ${index}`,
              alias: '',
              chain,
              addresses: [address],
              assets,
              index: item.index,
              type: walletType || this.selectedAsset.types[0],
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

          this.creatingAccount = false
          this.goToOverview()
        } catch (error) {
          this.ledgerError = { message: 'Error creating accounts' }
          console.error('error creating accounts', error)
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
    goToOverview() {
      this.$router.replace('/wallet')
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
      if (this.selectedAccounts[[item.account.address]]) {
        delete this.selectedAccounts[item.account.address]
        this.selectedAccounts = {
          ...this.selectedAccounts
        }
      } else {
        this.selectedAccounts = {
          ...this.selectedAccounts,
          [item.account.address]: item
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
