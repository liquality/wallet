<template>
  <div class="add-hardware-wallet">
    <NavBar :showMenu="false">
      <span class="add-hardware-wallet-header">
        Add Hardware Wallet
      </span>
    </NavBar>
    <div class="wrapper" v-if="currentStep === 'connect'">
      <div class="wrapper_top">
        <div class="step-detail">
          <div class="step-number">1</div>
          <div class="step-name">Connect Ledger</div>
          <div class="step-icon">
            <LedgerIcon />
          </div>
        </div>
        <ul class="step-instructions">
            <li>Plug the Ledger into the computer</li>
            <li>Enter pin to unlock it</li>
            <li>
              On the device, navigate to the asset that you want to access
            </li>
        </ul>
        <div class="step-separator"></div>
        <div class="indications">
          Select the corresponding asset
        </div>
        <p>
          <AssetDropdown :assets="ledgerOptions"
                         :selected="selectedAsset"
                         @asset-changed="setLedgerAsset"
                         :show-search="false" />
        </p>
      </div>
       <div class="wrapper_bottom">
        <div class="button-group">
          <button
            class="btn btn-light btn-outline-primary btn-lg"
            @click="goToOverview"
          >
            Cancel
          </button>
          <button
            class="btn btn-primary btn-lg btn-icon"
            @click="connect"
            :disabled="loading || !selectedAsset"
          >
            <SpinnerIcon class="btn-loading" v-if="loading" />
            <template v-else>Connect</template>
          </button>
        </div>
      </div>
    </div>
    <div class="wrapper" v-else>
      <div class="wrapper_top">
        <div class="step-detail">
          <div class="step-number">2</div>
          <div class="step-name">Unlock Account</div>
        </div>
        <div class="step-text" v-if="selectedAsset && selectedAsset.chain === 'BTC'">
              If you don’t see your existing Ledger aacounts below,
switch path to Legacy vs Segwit, Native Segwit or Costum
          </div>
        <div class="step-path" v-if="selectedAsset && selectedAsset.chain === 'BTC'">
        </div>
        <div class="indications">
          Select Account
        </div>
        <p>
          <ul class="list-group list-group-flush">
            <a href="#"
               v-for="item in addresses"
               :key="item.address"
               @click="selectAccount(item)"
               class="list-group-item list-group-item-action"
               :class="{
                 active: (selectedAccount && item.address === selectedAccount.address)
                }">
               {{ item.address }}
            </a>
          </ul>
        </p>
      </div>
       <div class="wrapper_bottom">
        <div class="button-group">
          <button
            class="btn btn-light btn-outline-primary btn-lg"
            @click="goToStep('connect')"
          >
            Cancel
          </button>
          <button
            class="btn btn-primary btn-lg btn-icon"
            @click="unlock"
            :disabled="loading || !selectedAccount"
          >
            <SpinnerIcon class="btn-loading" v-if="loading" />
            <template v-else>Unlock</template>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import NavBar from '@/components/NavBar'
import AssetDropdown from '@/components/AssetDropdown'
import SpinnerIcon from '@/assets/icons/spinner.svg'
import LedgerIcon from '@/assets/icons/ledger_icon.svg'
import { LEDGER_BITCOIN_OPTIONS, LEDGER_OPTIONS } from '@/utils/ledger-bridge-provider'
import { getChainFromAsset } from '@/utils/asset'

export default {
  components: {
    NavBar,
    AssetDropdown,
    SpinnerIcon,
    LedgerIcon
  },
  data () {
    return {
      currentStep: 'connect',
      loading: false,
      selectedAsset: null,
      addresses: [],
      selectedAccount: null
    }
  },
  methods: {
    ...mapActions([
      'createAccount',
      'getLedgerAddresses'
    ]),
    async connect () {
      this.loading = true

      try {
        if (this.selectedAsset) {
          const payload = {
            network: this.activeNetwork,
            walletId: this.activeWalletId,
            asset: this.selectedAsset.name,
            walletType: this.selectedAsset.type
          }

          const addresses = await this.getLedgerAddresses(payload)

          if (addresses.length > 0) {
            this.addresses = [...addresses]
            this.currentStep = 'unlock'
          } else {
            // TODO: manage errors
            console.log('no addresses found')
          }
        }
      } catch (error) {
        // TODO: manage errors
        console.log(error)
      } finally {
        this.loading = false
      }
    },
    async unlock () {
      // create the account
      if (this.selectedAccount && this.selectedAsset) {
        const { address } = this.selectedAccount
        const { type, chain } = this.selectedAsset
        const assetKeys = this.enabledAssets[this.activeNetwork]?.[this.activeWalletId] || []
        const assets = assetKeys.filter(asset => {
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
  computed: {
    ...mapState([
      'activeNetwork',
      'activeWalletId',
      'enabledAssets'
    ]),
    ledgerOptions () {
      return LEDGER_OPTIONS
    },
    bitcoinOptions () {
      return LEDGER_BITCOIN_OPTIONS
    }

  }
}
</script>

<style lang="scss" scoped>
.add-hardware-wallet {
  display: flex;
  flex-direction: column;

    .add-hardware-wallet-header {
      font-size: $font-size-head-title;
      font-style: normal;
      line-height: 26px;
      text-transform: uppercase;
      font-weight: $headings-font-weight;
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
        border: solid 1px #000D35;
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
          width: 179px
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
    }

    .step-separator {
      margin-top: 30px;
      margin-bottom: 30px;
      width: 320px;
      mix-blend-mode: normal;
      border: 1px solid #D9DFE5;
    }

    .indications {
      font-style: normal;
      font-weight: bold;
      font-size: 12px;
      line-height: 24px;
      display: flex;
      align-items: center;
      text-transform: uppercase;
      color: #3D4767;
    }
}
</style>
