<template>
  <div>
    <div class="liquality-timeline">
      <small id="start_time">{{ prettyTime(item.startTime) }}</small>
      <h3>Sent</h3>
      <div class="liquality-timeline_inner">
        <div class="liquality-timeline_container left completed">
          <div class="content">
            <h3 :id="item.from">
              From:
              <a :href="addressLink(fromAddress, item.from)" target="_blank" :id="fromAddress">{{
                shortenAddress(fromAddress)
              }}</a>
              <CopyIcon @click="copy(fromAddress)" />
            </h3>
          </div>
        </div>
        <div
          class="liquality-timeline_container right"
          :class="{ completed: item.status === 'SUCCESS' && tx && tx.confirmations > 0 }"
        >
          <div class="content">
            <h3 :id="item.to">
              To:
              <a
                :href="addressLink(item.toAddress, item.to)"
                target="_blank"
                :id="item.toAddress"
                >{{ shortenAddress(item.toAddress) }}</a
              >
              <CopyIcon @click="copy(item.toAddress)" />
            </h3>
          </div>
        </div>
      </div>
      <div v-if="item.status === 'SUCCESS' && tx && tx.confirmations > 0">
        <small>Received</small>
        <br />
        <small>{{ prettyTime(item.endTime) }}</small>
      </div>
    </div>
    <div class="text-center">
      <button
        class="btn btn-sm btn-outline-primary"
        id="advanced_button"
        @click="advanced = !advanced"
      >
        Advanced
      </button>
    </div>
    <div class="table" v-if="advanced">
      <table class="table bg-white border-0 mb-1 mt-1">
        <tbody class="font-weight-normal">
          <tr>
            <td class="text-muted text-right small-12">Amount</td>
            <td class="text-break">{{ prettyBalance(item.amount, item.from) }} {{ item.from }}</td>
          </tr>
          <tr v-if="fromAddress">
            <td class="text-muted text-right small-12">Your {{ item.from }}<br />from address</td>
            <td class="text-break">{{ fromAddress }}</td>
          </tr>
          <tr>
            <td class="text-muted text-right small-12">Your {{ item.to }}<br />to address</td>
            <td class="text-break">{{ item.toAddress }}</td>
          </tr>
          <tr>
            <td class="text-muted text-right small-12">Your {{ item.to }} send<br />transaction</td>
            <td class="text-break">{{ item.txHash }}</td>
          </tr>
          <tr v-if="false">
            <td class="text-muted text-right small-12">Actions</td>
            <td class="cursor-pointer text-danger" @click="remove">Remove this item</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState, mapGetters } from 'vuex'
import BN from 'bignumber.js'
import moment from '@/utils/moment'
// import cryptoassets from '@/utils/cryptoassets'
import { chains, assets as cryptoassets } from '@liquality/cryptoassets'

import { prettyBalance } from '@/utils/coinFormatter'
import { getNativeAsset, getAddressExplorerLink } from '@/utils/asset'

import CopyIcon from '@/assets/icons/copy.svg'
import { getSwapProviderConfig } from '@/utils/swaps'
import { calculateQuoteRate } from '@/utils/quotes'
import { shortenAddress } from '@/utils/address'

export default {
  components: {
    CopyIcon
  },
  data() {
    return {
      advanced: false,
      secretHidden: true,
      showFeeSelector: false,
      feeSelectorLoading: false,
      feeSelectorAsset: null,
      newFeePrice: null
    }
  },
  props: ['id', 'tx'],
  computed: {
    ...mapGetters(['client', 'accountItem', 'swapProvider']),
    ...mapState(['activeWalletId', 'activeNetwork', 'balances', 'history', 'fees']),
    item() {
      return this.history[this.activeNetwork][this.activeWalletId].find(
        (item) => item.id === this.id
      )
    },
    fromAddress() {
      return this.accountItem(this.item.accountId)?.addresses[0]
    },
    reverseRate() {
      return BN(1).div(calculateQuoteRate(this.item)).dp(8)
    },
    orderLink() {
      if (this.item.provider !== 'liquality') {
        return ''
      }
      const agent = getSwapProviderConfig(this.item.network, this.item.provider).agent
      return agent + '/api/swap/order/' + this.item.id + '?verbose=true'
    },
    feeSelectorFees() {
      return this.fees[this.activeNetwork]?.[this.activeWalletId]?.[
        getNativeAsset(this.feeSelectorAsset)
      ]
    },
    feeSelectorUnit() {
      const chain = cryptoassets[this.feeSelectorAsset].chain
      return chains[chain].fees.unit
    }
  },
  methods: {
    ...mapActions(['updateTransactionFee', 'updateFees', 'checkPendingActions']),
    getNativeAsset,
    prettyBalance,
    shortenAddress,
    prettyTime(timestamp) {
      return moment(timestamp).format('L, LT')
    },
    async copy(text) {
      await navigator.clipboard.writeText(text)
    },
    addressLink(address, asset) {
      console.log('address, asset', address, asset)
      if (this.item.accountId) {
        return getAddressExplorerLink(address, asset, this.activeNetwork)
      }

      return '#'
    }
  },
  created() {
    // this.updateTransactions()
    // this.interval = setInterval(() => {
    //   this.updateTransactions()
    // }, 5000)
  },
  beforeDestroy() {
    // clearInterval(this.interval)
  }
}
</script>

<style lang="scss">
.liquality-timeline {
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

    &.completed::after,
    &.pending::after {
      background-color: $color-secondary;
      border: 1px solid $hr-border-color;
    }

    &.completed:first-child::after,
    &.completed:last-child::after {
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

.border-0 {
  box-shadow: none !important;

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
