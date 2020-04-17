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
          <tr v-if="latestOrders.length === 0">
            <td colspan="6" class="text-center font-weight-light text-muted">No previous orders found</td>
          </tr>
          <tr
            v-for="(order, idx) in latestOrders"
            :key="order.id"
            @click="selectedOrder = order"
            class="cursor-pointer">
            <td scope="row" class="text-muted font-weight-light">{{orders.length - idx}}</td>
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
            <td class="text-center"><button :class="{
              'btn btn-block': true,
              'btn-link text-primary': order.status.toLowerCase() !== 'success',
              'btn-link text-success': order.status.toLowerCase() === 'success'
            }">{{order.status}}</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import BN from 'bignumber.js'
import { differenceInMinutes, differenceInSeconds } from 'date-fns'
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
      selectedWallet: null
    }
  },
  computed: {
    ...mapState(['orders']),
    latestOrders () {
      return this.orders.slice().reverse()
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
      const diff = Math.floor((order.endTime - order.startTime) / 1000)

      if (diff < 60) {
        return `${differenceInSeconds(order.endTime, order.startTime)}s`
      }

      return `${differenceInMinutes(order.endTime, order.startTime)}m`
    },
    getOrderProgress (order) {
      return ORDER_STATUS_MAP[order.status.toLowerCase()]
    },
    prettyAmount (chain, amount) {
      return cryptoassets[chain.toLowerCase()].unitToCurrency(amount)
    }
  }
}
</script>
