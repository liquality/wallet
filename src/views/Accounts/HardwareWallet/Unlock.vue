<template>
  <div class="wrapper">
    <div class="wrapper_top">
      <div class="step-detail">
        <div class="step-number">2</div>
        <div class="step-name">{{ $t('pages.accounts.unlockAccount') }}</div>
      </div>
      <!-- <div class="step-text" v-if="selectedAsset && selectedAsset.chain === 'bitcoin'">
        <div class="step-path">
          <button
            class="btn btn-link"
            v-tooltip.top="{
              content:
                'If you don’t see your existing Ledger accounts below, switch path to Legacy vs Native Segwit'
            }"
          >
            <InfoIcon class="info-icon" />
          </button>
          <div class="btn-group" v-click-away="hideLedgerBitcoinOptions">
            <button
              class="btn dropdown-toggle custom-dropdown-toggle"
              :disabled="loading || creatingAccount"
              @click="toggleLedgerBitcoinOptions"
            >
              BTC Version (HD Path): {{ ledgerBitcoinOption.label }}
              <ChevronUpIcon v-if="ledgerBitcoinOptionsOpen" />
              <ChevronDownIcon v-else />
            </button>
            <ul
              class="dropdown-menu dropdown-menu-end custom-dropdown-menu"
              :class="{ show: ledgerBitcoinOptionsOpen }"
            >
              <li v-for="option in ledgerBitcoinOptions" :key="option.addressType">
                <a
                  class="dropdown-item custom-dropdown-item"
                  href="#"
                  @click="selectLedgerBitcoinOption(option)"
                >
                  {{ option.label }}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div> -->
      <div v-if="loading" class="progress-container">
        <CircleProgressBar class="circle-progress infinity-rotate" />
        <div class="loading-message">
          <div>
            <span class="loading-message-title">{{ $t('common.loading') }}</span>
            <span class="loading-message-text">{{ $t('pages.accounts.findingAccounts') }}</span>
          </div>
        </div>
      </div>
      <div v-else-if="creatingAccount" class="progress-container">
        <CircleProgressBar class="circle-progress infinity-rotate" />
        <div class="loading-message">
          <div>
            <span class="loading-message-title">{{ $t('pages.accounts.creating') }}</span>
            <span class="loading-message-text">{{ $t('pages.accounts.creatingAccount') }}</span>
          </div>
        </div>
      </div>
      <div v-else class="account-list">
        <span class="indications">{{ $t('pages.accounts.selectAccount') }}</span>
        <p v-if="selectedAsset">
          <img :src="getAccountIcon(selectedAsset.chain)" class="asset-icon" />
          {{ accountsLabel }} {{ $t('pages.accounts.accountsLabel') }}
        </p>
        <div v-if="accounts && accounts.length > 0">
          <table class="table accounts-table">
            <tbody>
              <tr
                @click="selectAccount(item)"
                :class="{
                  disabled: item.exists,
                  selected: selectedAccounts[item.account]
                }"
                v-for="item in accounts"
                :key="item.account"
              >
                <td class="account-index">{{ item.index + 1 }}</td>
                <td class="account-address">
                  <div
                    v-tooltip.top="{
                      content: item.exists
                        ? $t('pages.accounts.accountAlreadyConnected', { account: item.account })
                        : item.account
                    }"
                  >
                    {{ shortenAddress(item.account) }}
                  </div>
                </td>
                <td class="balance">
                  <div>
                    <div v-if="showBalance">
                      {{ prettyBalance(item.balance, selectedAsset.name) }}
                      {{ selectedAsset.name }}
                    </div>
                    <!-- <div class="has-txns" v-else-if="item.balance !== '0'">Has Txns</div> -->
                    <div v-if="showBalance" class="fiat">
                      ${{ getFiatBalance(item.fiatBalance) }}
                    </div>
                  </div>
                </td>
                <td class="account-selected-mark">
                  <CheckRightIcon v-if="selectedAccounts[item.account]" />
                  <span v-else>&nbsp;</span>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="account-nav">
            <button class="btn btn-link" @click="prev" :disabled="currentPage <= 1">
              {{ $t('pages.accounts.previous') }}
            </button>

            <button class="btn btn-link" @click="next">{{ $t('common.next') }}</button>
          </div>
        </div>
        <div v-else class="account-message">
          <p>{{ $t('pages.accounts.accountMessage1') }}</p>
          <p>{{ $t('pages.accounts.accountMessage2') }}</p>
        </div>
      </div>
    </div>
    <div class="wrapper_bottom">
      <div class="button-group">
        <button class="btn btn-light btn-outline-primary btn-lg" @click="cancel">
          {{ $t('common.cancel') }}
        </button>
        <button
          v-if="ledgerError"
          class="btn btn-primary btn-lg btn-icon"
          @click="getCurrentPage"
          :disabled="loading || creatingAccount || !selectedAsset"
        >
          <SpinnerIcon class="btn-loading" v-if="loading" />
          <template v-else>{{ $t('pages.accounts.tryAgain') }}</template>
        </button>
        <button
          v-else
          class="btn btn-primary btn-lg btn-icon"
          @click="unlock"
          :disabled="loading || creatingAccount || Object.keys(selectedAccounts).length <= 0"
        >
          <SpinnerIcon class="btn-loading" v-if="loading" />
          <template v-else>{{ $t('pages.accounts.unlock') }}</template>
        </button>
      </div>
    </div>
  </div>
</template>
<script>
import SpinnerIcon from '@/assets/icons/spinner.svg'
import { LEDGER_BITCOIN_OPTIONS } from '@liquality/wallet-core/dist/src/utils/ledger'
import clickAway from '@/directives/clickAway'
import { getAccountIcon } from '@/utils/accounts'
import CircleProgressBar from '@/assets/icons/circle_progress_bar.svg'
import CheckRightIcon from '@/assets/icons/check.svg'
import { shortenAddress } from '@liquality/wallet-core/dist/src/utils/address'
import { prettyBalance, formatFiat } from '@liquality/wallet-core/dist/src/utils/coinFormatter'
import BN from 'bignumber.js'
import { ChainId } from '@liquality/cryptoassets'

export default {
  directives: {
    clickAway
  },
  components: {
    SpinnerIcon,
    CircleProgressBar,
    CheckRightIcon
  },
  props: [
    'loading',
    'creatingAccount',
    'accounts',
    'selectedAccounts',
    'selectedAsset',
    'ledgerError',
    'currentPage'
  ],
  data() {
    return {
      ledgerBitcoinOption: null,
      ledgerBitcoinOptionsOpen: false
    }
  },
  created() {
    this.ledgerBitcoinOption = this.ledgerBitcoinOptions[0]
  },
  methods: {
    prettyBalance,
    getAccountIcon,
    shortenAddress,
    unlock() {
      const walletType = this.getWalletType()
      this.$emit('on-unlock', { walletType })
    },
    getFiatBalance(balance) {
      return formatFiat(BN(balance || 0))
    },
    selectAccount(item) {
      if (!item.exists) {
        this.$emit('on-select-account', item)
      }
    },
    connect(nextPage) {
      const walletType = this.getWalletType()
      this.$emit('on-connect', {
        asset: this.selectedAsset,
        walletType,
        page: nextPage || this.currentPage
      })
    },
    prev() {
      this.connect(this.currentPage - 1)
    },
    next() {
      this.connect(this.currentPage + 1)
    },
    getCurrentPage() {
      this.connect(this.currentPage)
    },
    cancel() {
      this.$emit('on-cancel')
    },
    selectLedgerBitcoinOption(option) {
      this.ledgerBitcoinOption = option
      this.hideLedgerBitcoinOptions()
    },
    toggleLedgerBitcoinOptions() {
      this.ledgerBitcoinOptionsOpen = !this.ledgerBitcoinOptionsOpen
    },
    hideLedgerBitcoinOptions() {
      this.ledgerBitcoinOptionsOpen = false
    },
    getWalletType() {
      return {
        BTC: this.ledgerBitcoinOption?.name,
        ETH: null
      }[this.selectedAsset?.chain]
    }
  },
  computed: {
    ledgerBitcoinOptions() {
      return LEDGER_BITCOIN_OPTIONS.filter((o) => o.name !== this.ledgerBitcoinOption?.name)
    },
    accountsLabel() {
      return {
        BTC: 'Bitcoin',
        ETH: 'Ethereum'
      }[this.selectedAsset?.chain]
    },
    showBalance() {
      return !(this.selectedAsset?.chain === ChainId.Bitcoin)
    }
  },
  watch: {
    ledgerBitcoinOption: async function () {
      if (!this.loading) {
        await this.connect(1)
      }
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
    color: #000d35;
    img {
      margin-right: 11px;
    }
  }

  .account-message {
    position: absolute;
    margin-top: 100px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 360px;
    color: #1d1e21;
    height: 160px;
    background-color: rgba($color: #fff3bc, $alpha: 0.5);
    padding: 5px 20px 5px 20px;
    font-style: normal;
    font-weight: 300;
    font-size: 14px;
    line-height: 16px;
  }

  .accounts-table {
    margin-bottom: 0.3rem;

    tr {
      cursor: pointer;
      &:hover,
      &.selected {
        background-color: #f0f7f9;
        color: $color-text-primary;
      }
    }

    th,
    td {
      padding: 0.25rem;
      vertical-align: middle;
    }

    .account-index,
    .account-address {
      font-style: normal;
      font-weight: normal;
      font-size: 13px;
      line-height: 18px;
      align-items: center;
      color: #000d35;
      div {
        display: flex;
        width: 100%;
        height: 100%;
      }
    }

    .balance {
      .has-txns {
        color: $color-text-muted;
      }
      & > div {
        min-height: 45px;
      }
      div,
      .has-txns {
        text-align: right;
        display: flex;
        width: 100%;
        height: 100%;
        flex-direction: column;
        align-items: stretch;
        justify-content: flex-end;

        .fiat {
          color: $color-text-muted;
        }
      }
    }

    tr.disabled {
      cursor: default;
      .account-index,
      .account-address {
        color: $color-text-muted;
      }
    }

    .account-index,
    .account-selected-mark,
    .account-address {
      text-align: center;
    }

    .account-address {
      text-align: left;
    }
    .account-selected-mark {
      width: 37px;
    }
    .account-selected-mark svg {
      width: 13px;
      height: 9px;
    }
  }
}

.info-icon {
  width: 20px;
}
</style>
