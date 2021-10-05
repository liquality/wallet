<template>
  <div class="details-wrapper">
    <NavBar :showBackButton="true" :backClick="goBack" :backLabel="'Back'">
      {{ `Swap ${item.from} to ${item.to}` }}
    </NavBar>
   <div class="swap-details">
      <div class="swap-details_info">
        <div class="row">
          <div class="col" id="swap-details-status-section">
            <h2>Status</h2>
            <p>{{ status }}</p>
          </div>
          <div class="col">
            <CompletedIcon v-if="['SUCCESS', 'REFUNDED'].includes(item.status)" class="swap-details_status-icon" />
            <SpinnerIcon v-else class="swap-details_status-icon" />
          </div>
        </div>
        <div class="row">
          <div class="col">
            <h2>Sent</h2>
            <p :id="'sent-'+item.from">{{prettyBalance(item.fromAmount, item.from)}} {{ item.from }}</p>
          </div>
          <div class="col" id="pending_receipt_section">
            <h2 v-if="['SUCCESS', 'REFUNDED'].includes(item.status)">Received</h2>
            <h2 v-else>Pending Receipt</h2>
            <p>{{prettyBalance(item.toAmount, item.to)}} {{ item.to }}</p>
          </div>
        </div>
        <div class="row">
          <div class="col">
            <h2 class="d-flex align-items-center">Rate <SwapProviderLabel class="ml-2" :provider="item.provider" :network="activeNetwork" /></h2>
            <p>1 {{item.from}} = <span class="swap-details_rate">{{ rate }}</span> {{ item.to }}</p>
          </div>
        </div>
      </div>
      <div class="swap-details_fee" id="swap-details-network-fee-section">
        <div class="row">
          <div class="col">
            <h2>Network Speed/Fee</h2>
            <p v-for="fee in txFees" :key="fee.asset" :id="'network_fee_'+fee.asset">
              {{ fee.asset }} Fee: {{ fee.fee }} {{ fee.unit }}
            </p>
          </div>
        </div>
      </div>
      <Timeline :id="id" @retrySwap="retry()"/>
    </div>
    <Modal v-if="ledgerSignRequired && showLedgerModal" @close="showLedgerModal = false">
      <template #header>
        <h5>
          Sign to {{ ledgerModalTitle }}
        </h5>
      </template>
       <template>
         <div class="modal-title">
           On Your Ledger
         </div>
         <div class="ledger-options-container">
         <div class="ledger-options-instructions">
          Follow prompts to verify and accept the amount, then confirm the transaction. There may be a lag.
        </div>
        <p>
          <LedgerSignRquest class="ledger-sign-request"/>
        </p>
      </div>
       </template>
       <template #footer>
          <button class="btn btn-outline-clear"
                  @click="retry"
                  :disabled="retryingSwap">
            <template v-if="retryingSwap">...</template>
            <template v-else>Sign</template>
       </button>
      </template>
    </Modal>
  </div>
</template>

<script>
import { mapActions, mapState, mapGetters } from 'vuex'
import moment from '@/utils/moment'
import cryptoassets from '@/utils/cryptoassets'
import { chains } from '@liquality/cryptoassets'

import { prettyBalance, dpUI } from '@/utils/coinFormatter'
import { calculateQuoteRate } from '@/utils/quotes'
import { getStatusLabel } from '@/utils/history'
import { isERC20, getNativeAsset } from '@/utils/asset'

import CompletedIcon from '@/assets/icons/completed.svg'
import SpinnerIcon from '@/assets/icons/spinner.svg'
import NavBar from '@/components/NavBar.vue'
import Modal from '@/components/Modal'
import SwapProviderLabel from '@/components/SwapProviderLabel'
import LedgerSignRquest from '@/assets/icons/ledger_sign_request.svg'

import Timeline from '@/swaps/views/Timeline.vue'

export default {
  components: {
    CompletedIcon,
    SpinnerIcon,
    NavBar,
    Timeline,
    Modal,
    LedgerSignRquest,
    SwapProviderLabel
  },
  data () {
    return {
      showLedgerModal: false,
      retryingSwap: false
    }
  },
  props: ['id'],
  computed: {
    ...mapGetters(['client', 'accountItem']),
    ...mapState(['activeWalletId', 'activeNetwork', 'balances', 'history', 'fees']),
    item () {
      return this.history[this.activeNetwork][this.activeWalletId]
        .find((item) => item.id === this.id)
    },
    status () {
      return getStatusLabel(this.item)
    },
    txFees () {
      const fees = []
      const fromChain = cryptoassets[this.item.from].chain
      const toChain = cryptoassets[this.item.to].chain
      fees.push({
        asset: getNativeAsset(this.item.from),
        fee: this.item.fee,
        unit: chains[fromChain].fees.unit
      })
      if (toChain !== fromChain) {
        fees.push({
          asset: getNativeAsset(this.item.to),
          fee: this.item.claimFee,
          unit: chains[toChain].fees.unit
        })
      }
      return fees
    },
    rate () {
      const rate = calculateQuoteRate(this.item)
      return dpUI(rate)
    },
    ledgerModalTitle () {
      if (this.item.status === 'INITIATION_CONFIRMED') {
        return 'Fund'
      } else if (this.item.status === 'READY_TO_CLAIM') {
        return 'Claim'
      } else if (this.item.status === 'GET_REFUND') {
        return 'Refund'
      }

      return null
    },
    // TODO: should work for uniswap too
    ledgerSignRequired () {
      // :::::: Show the modal for ledger if we need it ::::::
      // Apply only for ledger accounts but the order should have an account id:
      if (this.item && (this.item.error || this.retryingSwap) && this.item.fromAccountId && this.item.toAccountId) {
      // Check the status and get the account related
        if (this.item.status === 'INITIATION_CONFIRMED') {
        // fund transaction only apply for erc20
          if (isERC20(this.item.from)) {
            const fromAccount = this.accountItem(this.item.fromAccountId)
            if (fromAccount?.type.includes('ledger')) {
              return true
            }
          }
        } else if (this.item.status === 'READY_TO_CLAIM') {
          const toAccount = this.accountItem(this.item.toAccountId)
          if (toAccount?.type.includes('ledger')) {
            return true
          }
        } else if (this.item.status === 'GET_REFUND') {
          const fromAccount = this.accountItem(this.item.fromAccountId)
          if (fromAccount?.type.includes('ledger')) {
            return true
          }
        }
      }

      return false
    }
  },
  methods: {
    ...mapActions(['retrySwap', 'updateTransactionFee', 'updateFees']),
    getNativeAsset,
    prettyBalance,
    prettyTime (timestamp) {
      return moment(timestamp).format('L, LT')
    },
    async copy (text) {
      await navigator.clipboard.writeText(text)
    },
    goBack () {
      this.$router.go(-1)
    },
    async retry () {
      if (this.retryingSwap) return
      this.retryingSwap = true
      try {
        await this.retrySwap({ swap: this.item })
        if (!this.item.error) {
          this.showLedgerModal = false
        }
      } finally {
        this.retryingSwap = false
      }
    }
  },
  created () {
    if (this.ledgerSignRequired) {
      this.showLedgerModal = true
    }
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
.swap-details {
  padding: $wrapper-padding 0;
  overflow-y: auto;
  overflow-x: hidden;
  flex: 1;

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

  &_info, &_fee, &_timeline {
    border-bottom: 1px solid $hr-border-color;
    margin-bottom: $wrapper-padding;
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
