<template>
  <Modal type="modal-lg" @close="$emit('close')">
    <div class="table-responsive">
      <table class="table bg-white border-0 mb-1 mt-1">
        <tbody class="font-weight-normal" v-if="item.type === 'SEND'">
          <tr>
            <td class="text-muted text-right small-12">Amount</td>
            <td>{{prettyBalance(item.amount, item.from)}} {{item.from}}</td>
          </tr>
          <tr v-if="item.fromAddress">
            <td class="text-muted text-right small-12">Your {{item.from}}<br>from address</td>
            <td>{{item.fromAddress}}</td>
          </tr>
          <tr>
            <td class="text-muted text-right small-12">Your {{item.to}}<br>to address</td>
            <td>{{item.toAddress}}</td>
          </tr>
          <tr>
            <td class="text-muted text-right small-12">Your {{item.to}} send<br>transaction</td>
            <td>{{item.txHash}}</td>
          </tr>
          <tr v-if="false">
            <td class="text-muted text-right small-12">Actions</td>
            <td class="cursor-pointer text-danger" @click="remove">Remove this item</td>
          </tr>
        </tbody>
        <tbody class="font-weight-normal" v-if="item.type === 'SWAP'">
          <tr>
            <td class="text-muted text-right small-12">Counter-party</td>
            <td>{{item.agent}}</td>
          </tr>
          <tr>
            <td class="text-muted text-right small-12">Order ID</td>
            <td><a :href="orderLink" rel="noopener" target="_blank">{{item.id}}</a></td>
          </tr>
          <tr>
            <td class="text-muted text-right small-12">Started At</td>
            <td>{{new Date(item.startTime)}}</td>
          </tr>
          <tr v-if="item.endTime">
            <td class="text-muted text-right small-12">Finished At</td>
            <td>{{new Date(item.endTime)}}</td>
          </tr>
          <tr>
            <td class="text-muted text-right small-12">Rate</td>
            <td>1 {{item.to}} = {{reverseRate}} {{item.from}}</td>
          </tr>
          <tr>
            <td class="text-muted text-right small-12">Status</td>
            <td>{{item.status}}</td>
          </tr>
          <tr>
            <td class="text-muted text-right small-12">Buy</td>
            <td>{{prettyBalance(item.toAmount, item.to)}} {{item.to}}</td>
          </tr>
          <tr>
            <td class="text-muted text-right small-12">Sell</td>
            <td>{{prettyBalance(item.fromAmount, item.from)}} {{item.from}}</td>
          </tr>
          <tr v-if="item.minConf">
            <td class="text-muted text-right small-12">Minimum<br>confirmations</td>
            <td>{{item.minConf}}</td>
          </tr>
          <tr v-if="item.fromAddress">
            <td class="text-muted text-right small-12">Your {{item.from}}<br>address</td>
            <td>{{item.fromAddress}}</td>
          </tr>
          <tr v-if="item.toAddress">
            <td class="text-muted text-right small-12">Your {{item.to}}<br>address</td>
            <td>{{item.toAddress}}</td>
          </tr>
          <tr v-if="item.secret">
            <td class="text-muted text-right small-12">Secret</td>
            <td>
              <span class="cursor-pointer text-muted font-weight-light" v-if="secretHidden" @click="secretHidden = false">
                Click to reveal the secret
              </span>
              <span v-else>
                {{item.secret}}
              </span>
            </td>
          </tr>
          <tr v-if="item.secretHash">
            <td class="text-muted text-right small-12">Secret Hash</td>
            <td>{{item.secretHash}}</td>
          </tr>
          <tr v-if="item.fromFundHash">
            <td class="text-muted text-right small-12">Your {{item.from}} funding<br>transaction</td>
            <td>{{item.fromFundHash}}</td>
          </tr>
          <tr v-if="item.toFundHash">
            <td class="text-muted text-right small-12">Counter-party's {{item.to}}<br>funding transaction</td>
            <td>{{item.toFundHash}}</td>
          </tr>
          <tr v-if="item.toClaimHash">
            <td class="text-muted text-right small-12">Your {{item.to}} claim<br>transaction</td>
            <td>{{item.toClaimHash}}</td>
          </tr>
          <tr v-if="item.sendTo">
            <td class="text-muted text-right small-12">Your {{item.to}} send to<br>address</td>
            <td>{{item.sendTo}}</td>
          </tr>
          <tr v-if="item.sendTx">
            <td class="text-muted text-right small-12">Your {{item.to}} send<br>transaction</td>
            <td>{{item.sendTx}}</td>
          </tr>
          <tr v-if="false">
            <td class="text-muted text-right small-12">Actions</td>
            <td class="cursor-pointer text-danger" @click="remove">Remove this item</td>
          </tr>
          <tr>
            <td class="text-muted text-right small-12">Actions</td>
            <td class="cursor-pointer text-danger" @click="$emit('close')">Close</td>
          </tr>
        </tbody>
      </table>
    </div>
  </Modal>
</template>

<script>
import BN from 'bignumber.js'

import { prettyBalance } from '@/utils/coinFormatter'
import Modal from '@/components/Modal'

export default {
  components: {
    Modal
  },
  data () {
    return {
      secretHidden: true
    }
  },
  props: {
    item: Object
  },
  computed: {
    reverseRate () {
      return BN(1).div(this.item.rate).dp(8)
    },
    orderLink () {
      return this.item.agent + '/api/swap/order/' + this.item.id + '?verbose=true'
    }
  },
  methods: {
    prettyBalance
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
