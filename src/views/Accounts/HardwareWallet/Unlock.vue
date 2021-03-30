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
        <div v-else class="account-list">
          <span class="indications">
            Select Account
          </span>
          <p v-if="selectedAsset">
            <img :src="getAssetIcon(selectedAsset.chain)"
                  class="asset-icon" />
             {{ accountsLabel }} Accounts
          </p>
          <div class="table-responsive"
               v-if="accounts && accounts.length > 0">
            <table class="table accounts-table">
            <tbody>
              <tr
                @click="selectAccount(item)"
                v-for="item in accounts"
                :key="item.account.address"
              >
                <td class="account-index">{{ (item.index + 1) }}</td>
                <td class="account-address"
                    v-tooltip.top="{ content: item.account.address }">
                  {{ shortenAddress(item.account.address) }}
                </td>
                <td class="account-selected-mark">
                  <CheckRightIcon v-if="selectedAccounts[item.account.address]"/>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="account-nav">
            <button class="btn btn-link" @click="prev" :disabled="currentPage <=0">
              Previous
            </button>

            <button class="btn btn-link"  @click="next">
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
            @click="getCurrentPage"
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
import CheckRightIcon from '@/assets/icons/check.svg'
import { shortenAddress } from '@/utils/address'

export default {
  directives: {
    clickAway
  },
  components: {
    SpinnerIcon,
    CircleProgressBar,
    ChevronDownIcon,
    ChevronUpIcon,
    CheckRightIcon
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
    shortenAddress,
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
    getCurrentPage () {
      this.connect(this.currentPage)
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

.account-list {
  p {
    font-weight: normal;
    font-size: 13px;
    display: flex;
    align-items: center;
    color: #000D35;
    img {
      margin-right: 11px;
    }
  }

  .accounts-table {
    tr {
      cursor: pointer;
    }

    .account-index,
    .account-address {
      font-style: normal;
      font-weight: normal;
      font-size: 13px;
      line-height: 18px;
      align-items: center;
      color: #000D35;
    }

    .account-index {
      padding: 0.55rem 0 0.55rem 0;
    }

    .account-index,
    .account-selected-mark,
    .account-address {
      text-align: center;
    }

    .account-address {
      padding: 0.55rem 34px 0.55rem 0.45rem;
      text-align: left;
    }

    .account-selected-mark {
      padding: 0.75rem 0 0.75rem 0;
      width: 13px;
    }
  }
}
</style>
