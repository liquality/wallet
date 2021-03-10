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
          <table class="table"
                 v-if="accounts && accounts.length > 0">
            <tbody>
              <tr
                @click="selectAccount(item)"
                v-for="(item, i) in accounts"
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
              No Accounts Found
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
            :disabled="loading || !selectedAccount"
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
import { LEDGER_OPTIONS } from '@/utils/ledger-bridge-provider'
import clickAway from '@/directives/clickAway'
import { getAssetIcon } from '@/utils/asset'
import CircleProgressBar from '@/assets/icons/circle_progress_bar.svg'

export default {
  directives: {
    clickAway
  },
  components: {
    SpinnerIcon,
    CircleProgressBar
  },
  props: ['selectedAsset', 'loading', 'selectedAccount', 'ledgerError', 'accounts'],
  methods: {
    getAssetIcon,
    unlock () {
      this.$emit('on-unlock')
    },
    selectAccount (account) {
      this.$emit('on-select-account', account)
    },
    connect () {
      this.$emit('on-connect', this.selectedAsset)
    },
    cancel () {
      this.$emit('on-cancel')
    }
  },
  computed: {
    assetList () {
      return LEDGER_OPTIONS
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
  .dropdown-toggle {
    padding-left: 0 !important;
    padding-right: 0 !important;
    font-weight: 300;
    display: flex;
    align-items: center;

    &::after {
      display: none;
    }

    .input-group-text {
      margin-left: 5px;
    }

    svg {
        width: 16px;
        margin-left: 4px;
    }
  }
  }
</style>
