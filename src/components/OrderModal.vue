<template>
  <Modal type="modal-lg" @close="$emit('close')">
    <div class="table-responsive">
      <table class="table bg-white border-0 mb-1 mt-1">
        <tbody class="font-weight-normal">
          <tr>
            <td class="text-muted text-right small-12">Order ID</td>
            <td class="col-sm-8">{{order.id}}</td>
          </tr>
          <tr v-if="order.minConf">
            <td class="text-muted text-right small-12">Minimum<br>confirmations</td>
            <td class="col-sm-8">{{order.minConf}}</td>
          </tr>
          <tr>
            <td class="text-muted text-right small-12">Your {{order.from}}<br>address</td>
            <td class="col-sm-8">{{order.fromAddress}}</td>
          </tr>
          <tr>
            <td class="text-muted text-right small-12">Your {{order.to}}<br>address</td>
            <td class="col-sm-8">{{order.toAddress}}</td>
          </tr>
          <tr>
            <td class="text-muted text-right small-12">From</td>
            <td class="col-sm-8">{{prettyBalance(order.from, order.fromAmount)}} {{order.from}}</td>
          </tr>
          <tr>
            <td class="text-muted text-right small-12">To</td>
            <td class="col-sm-8">{{prettyBalance(order.to, order.toAmount)}} {{order.to}}</td>
          </tr>
          <tr v-if="order.secretHash">
            <td class="text-muted text-right small-12">Secret Hash</td>
            <td class="col-sm-8">{{order.secretHash}}</td>
          </tr>
          <tr v-if="order.fromFundHash">
            <td class="text-muted text-right small-12">Your {{order.from}} funding<br>transaction</td>
            <td class="col-sm-8">{{order.fromFundHash}}</td>
          </tr>
          <tr v-if="order.toFundHash">
            <td class="text-muted text-right small-12">Counter-party's {{order.to}}<br>funding transaction</td>
            <td class="col-sm-8">{{order.toFundHash}}</td>
          </tr>
          <tr v-if="order.toClaimHash">
            <td class="text-muted text-right small-12">Your {{order.to}} claim<br>transaction</td>
            <td class="col-sm-8">{{order.toClaimHash}}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </Modal>
</template>

<script>
import cryptoassets from '@liquality/cryptoassets'

import Modal from '@/components/Modal'

export default {
  components: {
    Modal
  },
  data () {
    return {
      amount: 0
    }
  },
  props: {
    order: Object
  },
  methods: {
    prettyBalance (asset, value) {
      return cryptoassets[asset.toLowerCase()].unitToCurrency(value)
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
