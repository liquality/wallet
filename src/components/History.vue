<template>
  <div>
    <HistoryModal
      v-if="selectedItem"
      :item="selectedItem"
      @close="selectedItem = null" />
    <div class="table-responsive mb-4">
      <table class="table border bg-white table-history mb-0">
        <thead>
          <tr>
            <td scope="col" class="text-muted">#</td>
            <td scope="col" class="text-muted">Action</td>
            <td scope="col" class="text-muted">Description</td>
            <td scope="col" class="text-muted text-right">Rate</td>
            <td scope="col" class="text-muted text-center">Progress</td>
            <td scope="col" class="text-muted text-center">Status</td>
          </tr>
        </thead>
        <tbody class="font-weight-normal">
          <tr v-if="networkWalletHistory.length === 0">
            <td colspan="6" class="text-center font-weight-light text-muted">Empty</td>
          </tr>
          <tr
            v-for="(item, idx) in networkWalletHistory"
            :key="item.id"
            @click="selectedItem = item"
            class="cursor-pointer">
            <td scope="row" class="text-muted font-weight-light">{{networkWalletHistory.length - idx}}</td>
            <td scope="row">
              <span v-if="item.type === 'SEND'">Sent {{prettyBalance(item.amount, item.from)}} {{item.from}}</span>
              <span v-else-if="item.auto">Auto buy {{item.to}}</span>
              <span v-else>Buy {{item.to}}</span>
              <span class="badge badge-secondary ml-2 d-inline" v-if="item.waitingForLock">Queued</span>
              <p v-if="item.sendTo" class="mb-0 small text-muted font-weight-light">Send to {{item.sendTo}}</p>
              <p v-else-if="item.type === 'SEND'" class="mb-0 small text-muted font-weight-light">To {{item.toAddress}}</p>
            </td>
            <td class="nowrap">
              <span v-if="item.type === 'SWAP'">
                {{dpUI(prettyAmount(item.to, item.toAmount), item.to)}} <small class="text-muted">{{item.to}}
                  <br>
                {{dpUI(prettyAmount(item.from, item.fromAmount), item.from)}} {{item.from}}</small>
              </span>
            </td>
            <td class="text-right">
              <span v-if="item.type === 'SWAP'">
                <small class="text-muted">1 {{item.to}} =</small> {{dpUI(reverseRate(item.rate), item.from)}} <small class="text-muted">{{item.from}}</small>
              </span>
            </td>
            <td class="text-center">
              <span v-if="item.type === 'SWAP'">
                <button class="btn btn-block btn-link text-muted">
                  <span v-if="['QUOTE_EXPIRED'].includes(item.status)">
                    &mdash;
                  </span>
                  <span v-else-if="['SUCCESS', 'REFUNDED'].includes(item.status)">
                    Finished in {{getOrderDuration(item)}}
                  </span>
                  <span v-else>
                    {{getOrderProgress(item)}}/<span v-if="item.sendTo">8</span><span v-else>7</span>
                    <Pacman v-if="!item.waitingForLock" class="d-inline-block mr-3 ml-2" />
                  </span>
                </button>
              </span>
            </td>
            <td class="text-center">
              <button :class="{
                'btn btn-block': true,
                'btn-link text-primary': item.status !== 'SUCCESS',
                'btn-link text-success': item.status === 'SUCCESS'
              }">
                {{item.status}}
                <div class="text-12 text-muted" v-if="item.status === 'Getting Refund'">in {{getRefundIn(item, dateNow)}}</div>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import BN from 'bignumber.js'
import { differenceInHours, differenceInMinutes, differenceInSeconds } from 'date-fns'
import { mapState } from 'vuex'
import cryptoassets from '@liquality/cryptoassets'

import { dpUI, prettyBalance } from '@/utils/coinFormatter'
import Pacman from '@/components/Pacman'
import HistoryModal from '@/components/HistoryModal'

const ORDER_STATUS_MAP = {
  QUOTE: 1,
  SECRET_READY: 2,
  INITIATED: 3,
  WAITING_FOR_CONFIRMATIONS: 4,
  INITIATION_REPORTED: 5,
  READY_TO_EXCHANGE: 6,
  GET_REFUND: 6,
  READY_TO_SEND: 7
}

function getDuration (min, max, approx) {
  const diff = Math.floor((max - min) / 1000)

  if (diff >= 3600) {
    return `${differenceInHours(max, min)}h`
  }

  if (diff >= 60) {
    return `${differenceInMinutes(max, min)}m`
  }

  if (approx) return 'less than a min'

  return `${differenceInSeconds(max, min)}s`
}

export default {
  components: {
    Pacman,
    HistoryModal
  },
  data () {
    return {
      selectedItem: null,
      dateNow: null
    }
  },
  computed: {
    ...mapState(['activeNetwork', 'activeWalletId', 'history']),
    networkWalletHistory () {
      if (!this.history[this.activeNetwork]) return []
      if (!this.history[this.activeNetwork][this.activeWalletId]) return []

      return this.history[this.activeNetwork][this.activeWalletId].slice().reverse()
    }
  },
  methods: {
    dpUI,
    reverseRate (rate) {
      return BN(1).div(rate).dp(8)
    },
    getOrderDuration (item) {
      return getDuration(item.startTime, item.endTime)
    },
    getRefundIn (item, dateNow) {
      return getDuration(dateNow, item.swapExpiration * 1000, true)
    },
    getOrderProgress (item) {
      return ORDER_STATUS_MAP[item.status]
    },
    prettyAmount (chain, amount) {
      return cryptoassets[chain.toLowerCase()].unitToCurrency(amount)
    },
    prettyBalance
  },
  created () {
    this.dateNow = Date.now()

    this.dateNowInterval = setInterval(() => {
      this.dateNow = Date.now()
    }, 1000)
  },
  beforeDestroy () {
    clearInterval(this.dateNowInterval)
  }
}
</script>

<style lang="scss">
.text-12 {
  font-size: 12px;
}
</style>
