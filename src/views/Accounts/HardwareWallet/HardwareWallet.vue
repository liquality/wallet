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
      addresses: [],
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

          const addresses = await this.getLedgerAddresses(payload)

          if (addresses && addresses.length > 0) {
            this.addresses = [...addresses]
          } else {
            // TODO: manage errors
            this.ledgerError = { message: 'no addresses found' }
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
    },
    accountsLabel () {
      return {
        BTC: 'Bitcoin',
        ETH: 'Ethereum'
      }[this.selectedAsset?.chain]
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
    padding: 10px;

    .circle-progress {
      width: 175px;
    }

    .loading-message {
      z-index: 999;
      display: flex;
      position: absolute;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      padding-top: 55px;
    }
  }

  .no-accounts {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 200px;
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
      line-height: 18px;
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
    padding-top: 26px;
    padding-bottom: 26px;
    border-bottom: 1px solid $hr-border-color;
    border-bottom: 1px solid $hr-border-color;
    display: flex;
    align-items: center;

    .options-text {
      font-style: normal;
      font-weight: bold;
      font-size: 12px;
      line-height: 16px;
      display: flex;
      align-items: center;
      text-transform: uppercase;
      color: #3D4767;
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
