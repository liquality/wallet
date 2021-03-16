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
      this.ledgerPage += page || 0

      if (this.ledgerPage <= 0) {
        this.ledgerPage = 1
      }
      const from = (this.ledgerPage - 1) * LEDGER_PER_PAGE
      const to = from + LEDGER_PER_PAGE
      this.selectedAsset = asset
      this.loading = true
      this.ledgerError = null
      this.accounts = []

      try {
        if (asset) {
          this.currentStep = 'unlock'
          const payload = {
            network: this.activeNetwork,
            walletId: this.activeWalletId,
            asset: asset.name,
            walletType: walletType || asset.types[0],
            from,
            to
          }

          const accounts = await this.getLedgerAccounts(payload)

          if (accounts && accounts.length > 0) {
            this.accounts = [...accounts]
          } else {
            // TODO: manage errors
            this.ledgerError = { message: 'no accounts found' }
          }
          this.loading = false
        }
      } catch (error) {
        // TODO: manage errors
        this.ledgerError = error
        console.log('error getting accounts', error)
        this.loading = false
      }
    },
    async unlock () {
      // create the account
      if (this.selectedAccount && this.selectedAsset) {
        const { address } = this.selectedAccount
        const { type, chain } = this.selectedAsset
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
          type
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
