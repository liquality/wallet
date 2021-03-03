<template>
  <div class="account-container">
    <NavBar :showMenu="false">
      <span class="account-title">
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
          <AssetDropdown
            :assets="ledgerOptions"
            :selected="selectedAsset"
            @asset-changed="setLedgerAsset"
            :show-search="false"
          />
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
        <div
          class="step-text"
          v-if="selectedAsset && selectedAsset.chain === 'BTC'"
        >
          If you don’t see your existing Ledger accounts below, switch path to
          Legacy vs Segwit, Native Segwit or Costum
        </div>
        <div
          class="step-path"
          v-if="selectedAsset && selectedAsset.chain === 'BTC'"
        ></div>
        <div v-if="loading" class="progress-container">
          <CircleProgressBar class="circle-progress infinity-rotate" />
          <div class="loading-message">
            <h3>Loading</h3>
            <span>Finding Accounts</span>
          </div>
        </div>
        <div v-else>
          <span class="indications">
            Select Account
          </span>
          <p v-if="selectedAsset">
            <img :src="getAssetIcon(selectedAsset.chain)" 
                  class="asset-icon" />
             {{ accountsLabel }} Accounts
          </p>
          <table class="table"
                 v-if="addresses && addresses.length > 0">
            <tbody>
              <tr
                @click="selectAccount(item)"
                v-for="(item, i) in addresses"
                :key="item.address"
                :class="{
                  active:
                    selectedAccount && item.address === selectedAccount.address,
                }"
              >
                <td>{{ (i + 1)}}</td>
                <td>{{ item.address }}</td>
              </tr>
            </tbody>
          </table>
          <div v-else class="no-accounts">
              No Accounts here
          </div>
        </div>
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
            v-if="ledgerError"
            class="btn btn-primary btn-lg btn-icon"
            @click="connect"
            :disabled="loading || !selectedAsset"
          >
            <SpinnerIcon class="btn-loading" v-if="loading" />
            <template v-else>Try Again</template>
          </button>
          <button
            v-else
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
import CircleProgressBar from '@/assets/icons/circle_progress_bar.svg'
import LedgerIcon from '@/assets/icons/ledger_icon.svg'
import {
  LEDGER_BITCOIN_OPTIONS,
  LEDGER_OPTIONS
} from '@/utils/ledger-bridge-provider'
import { getAssetIcon, getChainFromAsset } from '@/utils/asset'

export default {
  components: {
    NavBar,
    AssetDropdown,
    SpinnerIcon,
    LedgerIcon,
    CircleProgressBar
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
    async connect () {
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

<style lang="scss" scoped>
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
  }

  .step-separator {
    margin-top: 30px;
    margin-bottom: 30px;
    width: 320px;
    mix-blend-mode: normal;
    border: 1px solid #d9dfe5;
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
