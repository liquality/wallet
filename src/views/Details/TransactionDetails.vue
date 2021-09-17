<template>
  <div class="details-wrapper">
    <NavBar :showBackButton="true" :backClick="goBack" :backLabel="'Back'">
      Transaction Detail
    </NavBar>
    <div class="tx-details">
      <div class="tx-details_info">
        <div class="row">
          <div class="col">
            <h2>Sent</h2>
            <p id="transaction_detail_sent_amount">{{ prettyBalance(item.amount, item.from) }} {{ item.from }}</p>
          </div>
        </div>
        <div class="row">
          <div class="col tx-details_link" id="send_to_tx_details_link">
            <h2>Sent To</h2>
            <p>
              <a :href="addressLink" target="_blank" id="transaction_details_send_to_link">{{ item.toAddress }}</a>
              <CopyIcon @click="copy(item.toAddress)" />
            </p>
          </div>
        </div>
        <div class="row" id="transaction_details_network_speed_fee">
          <div class="col">
            <h2>Network Speed/Fee</h2>
            <p>
              {{ prettyBalance(tx ? tx.fee : item.tx.fee, item.from) }}
              {{ assetChain }} | {{ item.fee }} {{ feeUnit }}
              <a
                v-if="canUpdateFee && !showFeeSelector"
                @click="openFeeSelector()"
              >
                Speed up
              </a>
            </p>
            <div v-if="showFeeSelector" class="mt-2">
              <FeeSelector
                :asset="item.from"
                v-model="selectedFee"
                v-bind:fees="assetFees"
                v-bind:fiatRates="fiatRates"
              />
              <button
                class="btn btn-sm btn-primary btn-icon ml-2"
                :disabled="feeSelectorLoading"
                @click="updateFee()"
              >
                <SpinnerIcon class="btn-loading" v-if="feeSelectorLoading" />
                <template v-else>Update</template>
              </button>
              <button
                class="btn btn-sm btn-outline-primary ml-2"
                v-if="!feeSelectorLoading"
                @click="closeFeeSelector()"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
        <div class="row" id="transaction_details_date_time">
          <div class="col">
            <h2>Time</h2>
            <p>{{ prettyTime(item.endTime || item.startTime) }}</p>
          </div>
        </div>
        <div class="row" id="transaction_details_status">
          <div class="col-10">
            <h2>Status</h2>
            <p>
              {{ status }}
              <span
                v-if="item.status === 'SUCCESS' && tx && tx.confirmations > 0"
              >
                / {{ tx.confirmations }} Confirmations
              </span>
            </p>
          </div>
          <div class="col">
            <CompletedIcon
              v-if="item.status === 'SUCCESS'"
              class="tx-details_status-icon"
            />
            <SpinnerIcon v-else class="tx-details_status-icon" />
          </div>
        </div>
        <div class="row">
          <div class="col tx-details_link" id="transaction_details_transaction_id">
            <h2>Transaction ID</h2>
            <p>
              <a :href="transactionLink" target="_blank" id="transactionLink">{{ item.txHash }}</a>
              <CopyIcon @click="copy(item.txHash)" />
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState, mapGetters } from 'vuex'
import moment from '@/utils/moment'
import cryptoassets from '@/utils/cryptoassets'
import { chains } from '@liquality/cryptoassets'

import { prettyBalance } from '@/utils/coinFormatter'
import { getStatusLabel } from '@/utils/history'
import {
  getNativeAsset,
  getTransactionExplorerLink,
  getAddressExplorerLink
} from '@/utils/asset'

import FeeSelector from '@/components/FeeSelector'
import CompletedIcon from '@/assets/icons/completed.svg'
import SpinnerIcon from '@/assets/icons/spinner.svg'
import CopyIcon from '@/assets/icons/copy.svg'
import NavBar from '@/components/NavBar.vue'

export default {
  components: {
    FeeSelector,
    CompletedIcon,
    SpinnerIcon,
    CopyIcon,
    NavBar
  },
  data () {
    return {
      tx: null,
      showFeeSelector: false,
      feeSelectorLoading: false,
      selectedFee: 'average'
    }
  },
  props: ['id'],
  computed: {
    ...mapGetters(['client']),
    ...mapState([
      'activeWalletId',
      'activeNetwork',
      'history',
      'fees',
      'fiatRates'
    ]),
    assetChain () {
      return getNativeAsset(this.item.from)
    },
    item () {
      return this.history[this.activeNetwork][this.activeWalletId].find(
        (item) => item.id === this.id
      )
    },
    status () {
      return getStatusLabel(this.item)
    },
    feeUnit () {
      return chains[cryptoassets[this.item.from].chain].fees.unit
    },
    addressLink () {
      return getAddressExplorerLink(
        this.item.toAddress,
        this.item.from,
        this.activeNetwork
      )
    },
    transactionLink () {
      return getTransactionExplorerLink(
        this.item.txHash,
        this.item.from,
        this.activeNetwork
      )
    },
    canUpdateFee () {
      return (
        this.feesAvailable &&
        this.tx &&
        (!this.tx.confirmations || this.tx.confirmations === 0)
      )
    },
    assetFees () {
      return this.fees[this.activeNetwork]?.[this.activeWalletId]?.[
        this.assetChain
      ]
    },
    feesAvailable () {
      return this.assetFees && Object.keys(this.assetFees).length
    }
  },
  methods: {
    ...mapActions(['updateTransactionFee', 'updateFees']),
    getNativeAsset,
    prettyBalance,
    prettyTime (timestamp) {
      return moment(timestamp).format('L, LT')
    },
    async copy (text) {
      await navigator.clipboard.writeText(text)
    },
    openFeeSelector () {
      this.showFeeSelector = true
      this.updateFees({ asset: this.assetChain })
    },
    closeFeeSelector () {
      this.showFeeSelector = false
      this.selectedFee = 'average'
    },
    async updateFee () {
      this.feeSelectorLoading = true
      const newFee = this.assetFees[this.selectedFee].fee
      try {
        this.tx = await this.updateTransactionFee({
          network: this.activeNetwork,
          walletId: this.activeWalletId,
          asset: this.item.from,
          id: this.item.id,
          hash: this.item.txHash,
          newFee
        })
      } finally {
        this.feeSelectorLoading = false
        this.closeFeeSelector()
      }
    },
    async updateTransaction () {
      const client = this.client({
        network: this.activeNetwork,
        walletId: this.activeWalletId,
        asset: this.item.from,
        accountId: this.item.accountId
      })
      const transaction =
        (await client.chain.getTransactionByHash(this.item.txHash)) ||
        this.item.tx
      this.tx = transaction
    },
    goBack () {
      this.$router.go(-1)
    }
  },
  created () {
    this.updateTransaction()
    this.interval = setInterval(() => this.updateTransaction(), 10000)
  },
  beforeDestroy () {
    clearInterval(this.interval)
  }
}
</script>

<style lang="scss">
.details-wrapper {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}
.tx-details {
  padding: $wrapper-padding 0;
  overflow-y: auto;
  overflow-x: hidden;
  flex: 1;

  &_link {
    p {
      display: flex;
      a {
        display: block;
        text-overflow: ellipsis;
        overflow: hidden;
      }
    }

    svg {
      flex: 0 0 14px;
      cursor: pointer;
      margin-left: 6px;
    }
  }

  .row {
    margin-bottom: 16px;

    p {
      margin-bottom: 0;
    }
  }

  h2 {
    font-size: $font-size-sm;
    font-weight: bold;
    text-transform: uppercase;
  }

  .row {
    padding: 0 $wrapper-padding;
  }

  &_status-icon {
    width: 28px;
    float: right;
  }
}
</style>
