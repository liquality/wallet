<template>
  <div class="tx-details-wrapper">
    <NavBar showBack="true" :backPath="`/account/${item.from}`" :backLabel="item.from">
      Transaction Detail
    </NavBar>
    <div class="tx-details">
      <div class="tx-details_info">
        <div class="row">
          <div class="col">
            <h2>Sent</h2>
            <p>{{prettyBalance(item.amount, item.from)}} {{item.from}}</p>
          </div>
        </div>
        <div class="row">
          <div class="col tx-details_link">
            <h2>Sent To</h2>
            <p><a :href="addressLink" target="_blank">{{ item.toAddress }}</a><CopyIcon @click="copy(item.toAddress)" /></p>
          </div>
        </div>
        <div class="row">
          <div class="col">
            <h2>Network Speed/Fee <a v-if="feesAvailable" class="btn btn-link" @click="showFeeSelecter()">Speed up</a></h2>
            <p>{{ assetChain }} Fee: {{prettyBalance(tx.fee, item.from)}} | GasPrice: {{ item.fee }} {{ feeUnit }}</p>
            <div v-if="feeSelectorVisible"><FeeSelector :asset="item.from" v-model="selectedFee" v-bind:fees="assetFees" v-bind:txTypes="[txType]" /></div>
          </div>
        </div>
        <div class="row">
          <div class="col">
            <h2>Time</h2>
            <p>{{ prettyTime(item.endTime || item.startTime) }}</p>
          </div>
        </div>
        <div class="row">
          <div class="col-10">
            <h2>Status</h2>
            <p>{{ status }} <span v-if="tx.confirmations > 0"> / {{ tx.confirmations }} Confirmations</span></p>
          </div>
          <div class="col">
            <CompletedIcon v-if="['SUCCESS', 'REFUNDED'].includes(item.status)" class="tx-details_status-icon" />
            <SpinnerIcon v-else class="tx-details_status-icon" />
          </div>
        </div>
        <div class="row">
          <div class="col tx-details_link">
            <h2>Transaction ID</h2>
            <p><a :href="transactionLink" target="_blank">{{ item.txHash }}</a><CopyIcon @click="copy(item.txHash)" /></p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState, mapGetters } from 'vuex'
import BN from 'bignumber.js'
import moment from '@/utils/moment'
import cryptoassets from '@liquality/cryptoassets'

import { prettyBalance } from '@/utils/coinFormatter'
import { getStatusLabel } from '@/utils/history'
import { TX_TYPES } from '@/utils/fees'
import { getChainFromAsset, getTransactionExplorerLink, getAddressExplorerLink } from '@/utils/asset'

import NavBar from '@/components/NavBar.vue'
import CompletedIcon from '@/assets/icons/completed.svg'
import SpinnerIcon from '@/assets/icons/spinner.svg'
import CopyIcon from '@/assets/icons/copy.svg'

export default {
  components: {
    NavBar,
    CompletedIcon,
    SpinnerIcon,
    CopyIcon
  },
  data () {
    return {
      tx: null,
      feeSelectorVisible: false,
      feeSelectorLoading: false,
      selectedFee: 'average'
    }
  },
  props: ['id'],
  computed: {
    ...mapGetters(['client']),
    ...mapState(['activeWalletId', 'activeNetwork', 'balances', 'history', 'fees']),
    assetChain () {
      return getChainFromAsset(this.item.from)
    },
    item () {
      return this.history[this.activeNetwork][this.activeWalletId]
        .find((item) => item.id === this.id)
    },
    status () {
      return getStatusLabel(this.item)
    },
    feeUnit () {
      return cryptoassets[this.assetChain].fees.unit
    },
    addressLink () {
      return getAddressExplorerLink(this.item.toAddress, this.item.from, this.activeNetwork)
    },
    transactionLink () {
      return getTransactionExplorerLink(this.item.txHash, this.item.from, this.activeNetwork)
    },
    assetFees () {
      return this.fees[this.activeNetwork]?.[this.activeWalletId]?.[this.assetChain]
    },
    feesAvailable () {
      return this.assetFees && Object.keys(this.assetFees).length
    },
    txType () {
      return TX_TYPES.SEND
    }
  },
  methods: {
    ...mapActions(['retrySwap', 'updateTransactionFee', 'updateFees']),
    getChainFromAsset,
    prettyBalance,
    prettyTime (timestamp) {
      return moment(timestamp).format('L, LT')
    },
    async copy (text) {
      await navigator.clipboard.writeText(text)
    },
    canUpdateFee (step) {
      return !this.tx.confirmations || this.tx.confirmations === 0
    },
    async updateFee () {
      this.feeSelectorLoading = true
      try {
        await this.updateTransactionFee({
          network: this.activeNetwork,
          walletId: this.activeWalletId,
          asset: this.from,
          id: this.item.id,
          hash: this.item.txHash,
          newFee: this.newFeePrice
        })
      } finally {
        this.feeSelectorLoading = false
        this.feeSelectorVisible = false
      }
    },
    async updateTransaction () {
      const client = this.client(this.activeNetwork, this.activeWalletId, this.item.from)
      const transaction = await client.chain.getTransactionByHash(this.item.txHash) || this.item.tx
      this.tx = transaction
    }
  },
  created () {
    this.updateTransaction()
    this.interval = setInterval(() => this.updateTransaction(), 5000)
  },
  beforeDestroy () {
    clearInterval(this.interval)
  }
}
</script>

<style lang="scss">
.tx-details-wrapper {
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

  &_rate {
    font-weight: bold;
    margin: 0 4px;
  }

  &_status-icon {
    width: 28px;
    float: right;
  }

  &_timeline {
    padding-bottom: 20px;
    text-align: center;

    &_inner {
      position: relative;
      width: 100%;
      margin: 8px 0;

      &::after {
        content: '';
        position: absolute;
        width: 0px;
        border-right: 1px dashed $color-secondary;
        top: 0;
        bottom: 0;
        left: 50%;
      }
    }

    h3 {
      margin: 2px 0;
      font-size: $font-size-base;
    }

    /* Container around content */
    &_container {
      min-height: 50px;
      position: relative;
      width: 50%;

      &::after {
        content: '';
        position: absolute;
        width: 11px;
        height: 11px;
        border: 1px solid $color-secondary;
        background: white;
        top: 0;
        border-radius: 50%;
        z-index: 1;
      }

      &.completed::after, &.pending::after {
        background-color: $color-secondary;
        border: 1px solid $hr-border-color;
      }

      &.completed:first-child::after, &.completed:last-child::after {
        background-color: $color-secondary;
        border: 0;
      }

      &:last-child {
        height: 0;
        min-height: 10px;
      }

      .content {
        position: relative;
        top: -3px;

        h3 svg {
          cursor: pointer;
          width: 14px;
          margin-left: 6px;
        }

        p {
          font-size: $font-size-sm;
          margin: 0;
        }
      }
    }

    /* Place the container to the left */
    .left {
      left: 0;
      padding-right: 14px;
      .content {
        text-align: right;
      }
    }

    /* Place the container to the right */
    .right {
      left: 50%;
      padding-left: 14px;
      .content {
        text-align: left;
      }
    }

    /* Fix the circle for containers on the right side */
    .right::after {
      left: -5px;
    }

    .left::after {
      right: -6px;
    }

  }

}
.border-0 {
  box-shadow: none!important;

  tr:first-child {
    td {
      border-top: 0;
    }
  }

  tr:last-child {
    td {
      border-bottom: 0;
    }
  }
}

.fee-update {
  padding-left: 10px;

  .btn-primary {
    margin-left: 10px;
    min-width: 60px;
  }

  &_fees {
    font-size: $font-size-tiny;
    margin: 6px 0;
  }
}
</style>
