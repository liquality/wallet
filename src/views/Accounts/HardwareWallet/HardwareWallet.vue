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
           @on-connect="connect"
           @on-unlock="unlock"
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
      ledgerError: null
    }
  },
  methods: {
    getAssetIcon,
    ...mapActions(['createAccount', 'getLedgerAddresses']),
    async connect (asset) {
      this.selectedAsset = asset
      this.loading = true
      this.ledgerError = null

      try {
        if (this.selectedAsset) {
          this.currentStep = 'unlock'

          const payload = {
            network: this.activeNetwork,
            walletId: this.activeWalletId,
            asset: this.selectedAsset.name,
            walletType: this.selectedAsset.type
          }

          const accounts = await this.getLedgerAddresses(payload)

          if (accounts && accounts.length > 0) {
            this.accounts = [...accounts]
          } else {
            // TODO: manage errors
            this.ledgerError = { message: 'no accounts found' }
          }
        }
      } catch (error) {
        // TODO: manage errors
        this.ledgerError = error
        console.log('error getting addresses', error)
      } finally {
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
        const data = {
          name: `Ledger ${this.selectedAsset.name}`,
          chain,
          addresses: [address],
          assets,
          type
        }

        await this.createAccount({
          network: this.activeNetwork,
          walletId: this.activeWalletId,
          account: data
        })
        this.goToOverview()
      }
    },
    goToOverview () {
      this.$router.replace('/wallet')
    },
    goToStep (step) {
      this.currentStep = step
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
.account-container {
  .progress-container {
    margin-top: 10px;
    display: flex;
    justify-content: center;
    align-items: center;

    .circle-progress {
      width: 175px;
    }

    .loading-message {
      z-index: 999;
      text-align: center;
      position: absolute;

      .loading-message-title {
        font-weight: 600;
        font-size: 14px;
        line-height: 18px;
        text-align: center;
        color: #000D35;
      }

      .loading-message-text {
        font-weight: 500;
        font-size: 11px;
        line-height: 16px;
        display: flex;
        align-items: center;
        text-align: center;
        color: #646F85;
      }
    }
  }

  .no-accounts {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 200px;
    font-weight: 600;
    font-size: 14px;
    line-height: 18px;
    text-align: center;
  }

  .step-detail {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    .step-number {
      font-style: normal;
      font-weight: 500;
      font-size: 13px;
      line-height: 13px;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border-radius: 28px;
      border: solid 1px #000d35;
    }

    .step-name {
      font-weight: bold;
      font-size: 12px;
      line-height: 24px;
      text-align: center;
      text-transform: uppercase;
      margin-top: 10px;
    }

    .step-icon {
      margin-top: 15px;
      svg {
        width: 179px;
      }
    }

    .step-text {
      margin-top: 15px;
      font-style: normal;
      font-weight: 300;
      font-size: 12px;
      line-height: 27px;
    }
  }

  .step-instructions {
    margin-top: 15px;
    font-style: normal;
    font-weight: 300;
    font-size: 16px;
    padding-left: 20px;
    line-height: 18px;
  }

  .options {
    margin-top: 30px;
    position: absolute;
    padding: 26px 20px;
    left: 0;
    border-top: 1px solid $hr-border-color;
    border-bottom: 1px solid $hr-border-color;
    display: flex;
    align-items: center;
    width: 100%;
    height: 80px;
    justify-content: space-between;

    .options-text {
      max-width: 210px;
      font-style: normal;
      font-weight: bold;
      font-size: 12px;
      line-height: 16px;
      display: flex;
      align-items: center;
      text-transform: uppercase;
      color: #3D4767;

      span {
        width: 120px;
      }
    }
  }

  .indications {
    font-style: normal;
    font-weight: bold;
    font-size: 12px;
    line-height: 24px;
    display: flex;
    align-items: center;
    text-transform: uppercase;
    color: #3d4767;
  }
}
</style>
