<template>
  <div>
    <OrderModal
      v-if="selectedOrder"
      :order="selectedOrder"
      :orderAgent="selectedOrderAgent"
      @close="selectedOrder = null" />
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
          <tr v-if="walletOrders.length === 0">
            <td colspan="6" class="text-center font-weight-light text-muted">No previous orders found</td>
          </tr>
          <tr
            v-for="(order, idx) in latestOrders"
            :key="order.id"
            @click="selectedOrder = order"
            class="cursor-pointer">
            <td scope="row" class="text-muted font-weight-light">{{walletOrders.length - idx}}</td>
            <td scope="row" class="text-muted font-weight-light">
              <span v-if="order.auto">Auto buy {{order.to}}</span>
              <span v-else>Buy {{order.to}}</span>
              <span class="badge badge-secondary ml-2 d-inline" v-if="waiting[order.id]">Queued</span>
              <p v-if="order.sendTo" class="mb-0 small">Send to {{order.sendTo}}</p>
            </td>
            <td class="nowrap">
              {{dpUI(prettyAmount(order.to, order.toAmount), order.to)}} <small class="text-muted">{{order.to}}
                <br>
              {{dpUI(prettyAmount(order.from, order.fromAmount), order.from)}} {{order.from}}</small>
            </td>
            <td class="text-right">
              <small class="text-muted">1 {{order.to}} =</small> {{dpUI(reverseRate(order.rate), order.from)}} <small class="text-muted">{{order.from}}</small>
            </td>
            <td class="text-center">
              <button class="btn btn-block btn-link text-muted">
                <span v-if="['quote expired'].includes(order.status.toLowerCase())">
                  &mdash;
                </span>
                <span v-else-if="['success', 'refunded'].includes(order.status.toLowerCase())">
                  Finished in {{getOrderDuration(order)}}
                </span>
                <span v-else>
                  {{getOrderProgress(order)}}/<span v-if="order.sendTo">7</span><span v-else>6</span>
                  <Pacman v-if="!waiting[order.id]" class="d-inline-block mr-3 ml-2" />
                </span>
              </button>
            </td>
            <td class="text-center">
              <button :class="{
                'btn btn-block': true,
                'btn-link text-primary': order.status.toLowerCase() !== 'success',
                'btn-link text-success': order.status.toLowerCase() === 'success'
              }">
                {{order.status}}
                <div class="text-12 text-muted" v-if="order.status === 'Getting Refund'">in {{getRefundIn(order, dateNow)}}</div>
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

import { dpUI } from '@/utils/coinFormatter'
import OrderModal from '@/components/OrderModal'
import Pacman from '@/components/Pacman'
import agents from '@/utils/agents'

const ORDER_STATUS_MAP = {
  quote: 1,
  secured: 2,
  initiated: 3,
  'waiting for confirmations': 4,
  exchanging: 5,
  'ready to exchange': 5,
  'getting refund': 5,
  'ready to send': 6
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
  props: {
    waiting: Object
  },
  components: {
    Pacman,
    OrderModal
  },
  data () {
    return {
      selectedOrder: null,
      selectedWallet: null,
      dateNow: null
    }
  },
  computed: {
    ...mapState(['orders']),
    walletId () {
      return this.$route.params.walletId
    },
    walletOrders () {
      return this.orders.filter(order => order.walletId === this.walletId)
    },
    latestOrders () {
      return this.walletOrders.slice().reverse()
    },
    selectedOrderAgent () {
      return agents[this.selectedOrder.agentIndex]
    }
  },
  methods: {
    dpUI,
    reverseRate (rate) {
      return BN(1).div(rate).dp(8)
    },
    getOrderDuration (order) {
      return getDuration(order.startTime, order.endTime)
    },
    getRefundIn (order, dateNow) {
      return getDuration(dateNow, order.swapExpiration * 1000, true)
    },
    getOrderProgress (order) {
      return ORDER_STATUS_MAP[order.status.toLowerCase()]
    },
    prettyAmount (chain, amount) {
      return cryptoassets[chain.toLowerCase()].unitToCurrency(amount)
    }
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
