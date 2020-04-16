<template>
  <Modal type="modal-lg" @close="$emit('close')">
    <div class="table-responsive">
      <table class="table bg-white border-0 mb-1 mt-1">
        <tbody class="font-weight-normal">
          <tr v-if="orderAgent">
            <td class="text-muted text-right small-12">Counter-party</td>
            <td>{{orderAgent}}</td>
          </tr>
          <tr>
            <td class="text-muted text-right small-12">Order ID</td>
            <td><a :href="orderLink" rel="noopener" target="_blank">{{order.id}}</a></td>
          </tr>
          <tr>
            <td class="text-muted text-right small-12">Started At</td>
            <td>{{new Date(order.startTime)}}</td>
          </tr>
          <tr v-if="order.endTime">
            <td class="text-muted text-right small-12">Finished At</td>
            <td>{{new Date(order.endTime)}}</td>
          </tr>
          <tr>
            <td class="text-muted text-right small-12">Rate</td>
            <td>1 {{order.to}} = {{reverseRate}} {{order.from}}</td>
          </tr>
          <tr>
            <td class="text-muted text-right small-12">Status</td>
            <td>{{order.status}}</td>
          </tr>
          <tr>
            <td class="text-muted text-right small-12">Buy</td>
            <td>{{prettyBalance(order.to, order.toAmount)}} {{order.to}}</td>
          </tr>
          <tr>
            <td class="text-muted text-right small-12">Sell</td>
            <td>{{prettyBalance(order.from, order.fromAmount)}} {{order.from}}</td>
          </tr>
          <tr v-if="order.minConf">
            <td class="text-muted text-right small-12">Minimum<br>confirmations</td>
            <td>{{order.minConf}}</td>
          </tr>
          <tr v-if="order.fromAddress">
            <td class="text-muted text-right small-12">Your {{order.from}}<br>address</td>
            <td>{{order.fromAddress}}</td>
          </tr>
          <tr v-if="order.toAddress">
            <td class="text-muted text-right small-12">Your {{order.to}}<br>address</td>
            <td>{{order.toAddress}}</td>
          </tr>
          <tr v-if="order.secret">
            <td class="text-muted text-right small-12">Secret</td>
            <td><span class="cursor-pointer text-muted font-weight-light" v-if="hidden" @click="hidden = false">Click to reveal the secret</span><span v-else>{{order.secret}}</span></td>
          </tr>
          <tr v-if="order.secretHash">
            <td class="text-muted text-right small-12">Secret Hash</td>
            <td>{{order.secretHash}}</td>
          </tr>
          <tr v-if="order.fromFundHash">
            <td class="text-muted text-right small-12">Your {{order.from}} funding<br>transaction</td>
            <td>{{order.fromFundHash}}</td>
          </tr>
          <tr v-if="order.toFundHash">
            <td class="text-muted text-right small-12">Counter-party's {{order.to}}<br>funding transaction</td>
            <td>{{order.toFundHash}}</td>
          </tr>
          <tr v-if="order.toClaimHash">
            <td class="text-muted text-right small-12">Your {{order.to}} claim<br>transaction</td>
            <td>{{order.toClaimHash}}</td>
          </tr>
          <tr v-if="order.sendTo">
            <td class="text-muted text-right small-12">Your {{order.to}} send to<br>address</td>
            <td>{{order.sendTo}}</td>
          </tr>
          <tr v-if="order.sendTx">
            <td class="text-muted text-right small-12">Your {{order.to}} send<br>transaction</td>
            <td>{{order.sendTx}}</td>
          </tr>
          <tr>
            <td class="text-muted text-right small-12">Actions</td>
            <td class="cursor-pointer text-danger" @click="remove">Remove this order</td>
          </tr>
        </tbody>
      </table>
    </div>
  </Modal>
</template>

<script>
import BN from 'bignumber.js'
import cryptoassets from '@liquality/cryptoassets'

import Modal from '@/components/Modal'

export default {
  components: {
    Modal
  },
  data () {
    return {
      hidden: true
    }
  },
  props: {
    order: Object,
    orderAgent: String
  },
  computed: {
    reverseRate () {
      return BN(1).div(this.order.rate).dp(8)
    },
    orderLink () {
      return this.orderAgent + '/order/' + this.order.id + '?verbose=true'
    }
  },
  methods: {
    prettyBalance (asset, value) {
      return cryptoassets[asset.toLowerCase()].unitToCurrency(value)
    },
    remove () {
      this.$store.commit('REMOVE_ORDER', this.order)
      this.$emit('close')
    }
  }
}
</script>

<style lang="scss">
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
</style>
