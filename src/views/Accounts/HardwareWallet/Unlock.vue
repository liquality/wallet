<template>
 <div class="wrapper">
      <div class="wrapper_top">
        <div class="step-detail">
          <div class="step-number">2</div>
          <div class="step-name">Unlock Account</div>
        </div>
        <div
          class="step-text"
          v-if="selectedAsset && selectedAsset.chain === 'BTC'"
        >
          <div>
            If you don’t see your existing Ledger accounts below, switch path to
            Legacy vs Native Segwit
          </div>
          <div
          class="step-path"
          v-if="selectedAsset && selectedAsset.chain === 'BTC'"
        >
        <div class="btn-group" v-click-away="hideLedgerBitcoinOptions">
          <button class="btn dropdown-toggle custom-dropdown-toggle"
                  :disabled="loading"
                  @click="toogleLedgerBitcoinOptions">
            BTC Version (HD Path): {{ ledgerBitcoinOption.label }}
            <ChevronUpIcon v-if="ledgerBitcoinOptionsOpen" />
            <ChevronDownIcon v-else />
          </button>
          <ul class="dropdown-menu dropdown-menu-end custom-dropdown-menu" :class="{ show: ledgerBitcoinOptionsOpen }">
            <li v-for="option in ledgerBitcoinOptions" :key="option.addressType">
              <a class="dropdown-item custom-dropdown-item" href="#" @click="selectLedgerBitcoinOption(option)">
                 {{ option.label }}
              </a>
            </li>
          </ul>
        </div>
        </div>
        </div>
        <div v-if="loading" class="progress-container">
          <CircleProgressBar class="circle-progress infinity-rotate" />
          <div class="loading-message">
            <div>
              <span class="loading-message-title">Loading</span>
              <span class="loading-message-text">Finding Accounts</span>
            </div>
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
          <div class="table-responsive"
               v-if="accounts && accounts.length > 0" clas>
            <table class="table">
            <tbody>
              <tr
                @click="selectAccount(item)"
                v-for="item in accounts"
                :key="item.account.address"
                :class="{
                  active: selectedAccounts[item.account.address]
                }"
              >
                <td>{{ item.index }}</td>
                <td>{{ item.account.address }}</td>
              </tr>
            </tbody>
          </table>
          <div class="account-nav">
            <button class="btn btn-icon" @click="prev">
              Previous
            </button>

            <button class="btn btn-icon"  @click="next">
              Next
            </button>
          </div>
          </div>
          <div v-else class="no-accounts">
            {{ ledgerError && ledgerError.message ? ledgerError.message : 'No Accounts Found' }}
          </div>
        </div>
      </div>
      <div class="wrapper_bottom">
        <div class="button-group">
          <button
            class="btn btn-light btn-outline-primary btn-lg"
            @click="cancel"
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
            :disabled="loading || Object.keys(selectedAccounts).length <= 0"
          >
            <SpinnerIcon class="btn-loading" v-if="loading" />
            <template v-else>Unlock</template>
          </button>
        </div>
      </div>
    </div>
</template>
<script>
import SpinnerIcon from '@/assets/icons/spinner.svg'
import { LEDGER_BITCOIN_OPTIONS } from '@/utils/ledger-bridge-provider'
import clickAway from '@/directives/clickAway'
import { getAssetIcon } from '@/utils/asset'
import CircleProgressBar from '@/assets/icons/circle_progress_bar.svg'
import ChevronDownIcon from '@/assets/icons/chevron_down.svg'
import ChevronUpIcon from '@/assets/icons/chevron_up.svg'

export default {
  directives: {
    clickAway
  },
  components: {
    SpinnerIcon,
    CircleProgressBar,
    ChevronDownIcon,
    ChevronUpIcon
  },
  props: [
    'loading',
    'accounts',
    'selectedAccounts',
    'selectedAsset',
    'selectedWalletType',
    'ledgerError',
    'currentPage'
  ],
  data () {
    return {
      ledgerBitcoinOption: null,
      ledgerBitcoinOptionsOpen: false
    }
  },
  created () {
    this.ledgerBitcoinOption = this.ledgerBitcoinOptions[0]
  },
  methods: {
    getAssetIcon,
    unlock () {
      const walletType = this.getWalletType()
      this.$emit('on-unlock', { walletType })
    },
    selectAccount (item) {
      this.$emit('on-select-account', item)
    },
    connect (nextPage) {
      const walletType = this.getWalletType()
      this.$emit('on-connect',
        {
          asset: this.selectedAsset,
          walletType,
          page: nextPage || this.currentPage
        })
    },
    prev () {
      this.connect(this.currentPage - 1)
    },
    next () {
      this.connect(this.currentPage + 1)
    },
    cancel () {
      this.$emit('on-cancel')
    },
    selectLedgerBitcoinOption (option) {
      this.ledgerBitcoinOption = option
      this.hideLedgerBitcoinOptions()
    },
    toogleLedgerBitcoinOptions () {
      this.ledgerBitcoinOptionsOpen = !this.ledgerBitcoinOptionsOpen
    },
    hideLedgerBitcoinOptions () {
      this.ledgerBitcoinOptionsOpen = false
    },
    getWalletType () {
      return {
        BTC: this.ledgerBitcoinOption?.name,
        ETH: null
      }[this.selectedAsset?.chain]
    }
  },
  computed: {
    ledgerBitcoinOptions () {
      return LEDGER_BITCOIN_OPTIONS.filter(
        o => o.name !== this.ledgerBitcoinOption?.name
      )
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
.account-nav {
  display: flex;
  justify-content: space-between;
}
</style>
