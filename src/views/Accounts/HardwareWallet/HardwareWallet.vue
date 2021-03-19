<template>
  <div class="account-container">
    <NavBar :showMenu="false">
      <span class="account-title">
        Add Hardware Wallet
      </span>
    </NavBar>
    <Connect v-if="currentStep === 'connect'"
           :loading="loading"
           :selected-asset="selectedAsset"
           @on-connect="connect"
           @on-select-asset="setLedgerAsset"
    />
    <Unlock v-else
           :loading="loading"
           :accounts="accounts"
           :selected-asset="selectedAsset"
           :selected-account="selectedAccount"
           :ledger-error="ledgerError"
           :currentPage="ledgerPage"
           @on-connect="connect"
           @on-unlock="unlock"
           @on-cancel="cancel"
           @on-select-account="selectAccount"
    />
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import NavBar from '@/components/NavBar'
import Connect from './Connect'
import Unlock from './Unlock'
import {
  LEDGER_BITCOIN_OPTIONS,
  LEDGER_OPTIONS
} from '@/utils/ledger-bridge-provider'
import { getAssetIcon, getChainFromAsset } from '@/utils/asset'

const LEDGER_PER_PAGE = 5

export default {
  components: {
    NavBar,
    Connect,
    Unlock
  },
  data () {
    return {
      currentStep: 'connect',
      loading: false,
      selectedAsset: null,
      accounts: [],
      selectedAccount: null,
      ledgerError: null,
      ledgerPage: 0
    }
  },
  methods: {
    getAssetIcon,
    ...mapActions(['createAccount', 'getLedgerAccounts']),
    async connect ({ asset, walletType, page }) {
      this.selectedAsset = asset
      this.loading = true
      this.ledgerError = null
      this.accounts = []

      try {
        if (asset) {
          let currentPage = this.ledgerPage + (page || 0)

          if (currentPage <= 0) {
            currentPage = 1
          }
          const startingIndex = (currentPage - 1) * LEDGER_PER_PAGE
          this.currentStep = 'unlock'
          const payload = {
            network: this.activeNetwork,
            walletId: this.activeWalletId,
            asset: asset.name,
            walletType: walletType || asset.types[0],
            startingIndex,
            numAddresses: LEDGER_PER_PAGE
          }

          const accounts = await this.getLedgerAccounts(payload)

          if (accounts && accounts.length > 0) {
            this.accounts = [...accounts]
            this.ledgerPage = currentPage
          } else {
            // TODO: manage errors
            this.ledgerError = { message: 'No accounts found' }
          }
        }
        this.loading = false
      } catch (error) {
        this.ledgerError = { message: error.message || 'Error getting accounts' }
        console.error('error getting accounts', error)
        this.loading = false
      }
    },
    async unlock ({ walletType }) {
      // create the account
      if (this.selectedAccount && this.selectedAsset) {
        const { address } = this.selectedAccount
        const { chain } = this.selectedAsset
        const assetKeys =
          this.enabledAssets[this.activeNetwork]?.[this.activeWalletId] || []
        const assets = assetKeys.filter((asset) => {
          const assetChain = getChainFromAsset(asset)
          return assetChain === this.selectedAsset.chain
        })
        const account = {
          name: `Ledger ${this.selectedAsset.name}`,
          chain,
          addresses: [address],
          assets,
          type: walletType || this.selectedAsset.types[0]
        }

        await this.createAccount({
          network: this.activeNetwork,
          walletId: this.activeWalletId,
          account
        })
        this.goToOverview()
      }
    },
    goToOverview () {
      this.$router.replace('/wallet')
    },
    cancel () {
      this.loading = false
      this.ledgerError = null
      this.accounts = []
      this.selectedAccount = null
      this.currentStep = 'connect'
    },
    setLedgerAsset (asset) {
      this.selectedAsset = asset
    },
    selectAccount (account) {
      this.selectedAccount = account
    }
  },
  created () {
    this.selectedAsset = this.ledgerOptions[0]
  },
  computed: {
    ...mapState(['activeNetwork', 'activeWalletId', 'enabledAssets']),
    ledgerOptions () {
      return LEDGER_OPTIONS
    },
    bitcoinOptions () {
      return LEDGER_BITCOIN_OPTIONS
    }
  }
}
</script>

<style lang="scss">
</style>
