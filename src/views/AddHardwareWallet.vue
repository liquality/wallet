<template>
  <div class="add-hardware-wallet">
    <NavBar :showMenu="false">
      <span class="header">
        <strong>Add Hardware Wallet</strong>
      </span>
    </NavBar>
    <div class="wrapper" v-if="currentStep === 'connect'">
      <div class="wrapper_top">
        <div class="step-name">1. Connect Ledger</div>
        <p class="mt-1">
          <ul class="list-group">
            <li class="list-group-item">- Plug the Ledger into the computer</li>
            <li class="list-group-item">- Enter pin to unlock it</li>
            <li class="list-group-item">
              - On the device, navigate to the asset that you want to access
            </li>
          </ul>
        </p>
        <p class="mt-1">
          Select the corresponding asset here
        </p>
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
      <div class="step-name">2. Unlock Account</div>
        <p>
          If you don’t see your existing Ledger aacounts below,
          switch path to Legacy vs Segwit, Native Segwit or Costum
        </p>
        <p>

        </p>
        <p>
          Select Account
        </p>
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
import { LEDGER_BITCOIN_OPTIONS, LEDGER_OPTIONS } from '@/utils/ledger-bridge-provider'

export default {
  components: {
    NavBar,
    AssetDropdown,
    SpinnerIcon
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
        const data = {
          name: `Ledger ${this.selectedAsset.name}`,
          chain,
          addresses: [address],
          assets: [this.selectedAsset.name],
          type
        }

        const account = await this.createAccount({
          network: this.activeNetwork,
          walletId: this.activeWalletId,
          account: data
        })
        console.log('ACCOUNT CREATED: ', account)
        this.$router.replace('/wallet')
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
      'activeWalletId'
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

    .header {
        font-weight: normal;
        text-transform: uppercase;
    }

    .step-name {
      font-weight: normal;
      font-size: 18px;
      line-height: 36px;
      text-align: center;
      letter-spacing: -0.08px;
    }

}
</style>
