<template>
  <div class="tx-details-wrapper">
    <NavBar showBack="true" :backPath="`/account/${item.from}`" :backLabel="item.from">
      Swap {{item.from}} to {{item.to}}
    </NavBar>
    <div class="tx-details">
      <div class="tx-details_info">
        <div class="row">
          <div class="col">
            <h2>Status</h2>
            <p>{{ status }} <br /> <small class="text-muted">{{ item.status }}</small></p>
          </div>
          <div class="col">
            <CompletedIcon v-if="['SUCCESS', 'REFUNDED'].includes(item.status)" class="tx-details_status-icon" />
            <SpinnerIcon v-else class="tx-details_status-icon" />
          </div>
        </div>
        <div class="row">
          <div class="col">
            <h2>Sent</h2>
            <p>{{prettyBalance(item.fromAmount, item.from)}} {{item.from}}</p>
          </div>
          <div class="col">
            <h2>Received</h2>
            <p>{{prettyBalance(item.toAmount, item.to)}} {{item.to}}</p>
          </div>
        </div>
        <div class="row">
          <div class="col">
            <h2>Rate</h2>
            <p>1 {{item.from}} = <span class="tx-details_rate">{{item.rate}}</span> {{item.to}}</p>
          </div>
        </div>
      </div>
      <div class="tx-details_fee">
        <div class="row">
          <div class="col">
            <h2>Network Speed/Fee</h2>
            <p v-for="fee in fees" :key="fee.chain">
              {{ fee.chain }} Fee: {{ fee.fee }} {{ fee.unit }}
            </p>
          </div>
        </div>
      </div>
      <div class="tx-details_timeline">
        <small>{{ prettyTime(item.startTime) }}</small>
        <h3>Start</h3>
        <div class="tx-details_timeline_inner">
          <div class="tx-details_timeline_container left completed"><div class="content"></div></div>
          <div class="tx-details_timeline_container"
            v-for="(step, id) in timeline" :key="id"
            :class="{ [step.side]: true, completed: step.completed }">
            <div class="content">
              <template v-if="step.tx">
                <h3>
                  <a :href="step.tx.explorerLink" target="_blank">{{ step.title }}</a>
                  <CopyIcon @click="copy(step.tx.hash)"/>
                </h3>
                <p class="text-muted" v-if="step.tx.totalFee">Fee: {{prettyBalance(step.tx.totalFee, step.tx.asset)}} {{ getChainFromAsset(step.tx.asset) }}</p>
                <p class="text-muted">Confirmations: {{ step.tx.confirmations || 0 }}</p>
              </template>
              <h3 v-else>
                <span :class="{'text-muted': !step.completed}">{{ step.title }}</span>
              </h3>
            </div>
          </div>
        </div>
        <template v-if="timeline.length === 4 && timeline[3].completed">
          <h3>Done</h3>
          <small>{{ prettyTime(item.endTime) }}</small>
        </template>
      </div>
      <div class="text-center">
        <button class="btn btn-sm btn-outline-primary" @click="advanced = !advanced">Advanced</button>
      </div>
      <div class="table" v-if="advanced">
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
            <tr v-if="item.error">
              <td class="text-danger text-right small-12">Error</td>
              <td class="text-danger">
                <pre>{{item.error}}</pre>
              </td>
            </tr>
            <tr>
              <td class="text-muted text-right small-12">Actions</td>
              <td class="text-danger">
                <span class="cursor-pointer mr-3" v-if="item.error" @click="retry">Retry</span>
              </td>
            </tr>
          </tbody>
        </table>
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
import { ORDER_STATUS_LABEL_MAP } from '@/utils/order'
import { getChainFromAsset, getExplorerLink } from '@/utils/asset'

import NavBar from '@/components/NavBar.vue'
import CompletedIcon from '@/assets/icons/completed.svg'
import SpinnerIcon from '@/assets/icons/spinner.svg'
import CopyIcon from '@/assets/icons/copy.svg'

const STEPS = {
  QUOTE: 0,
  SECRET_READY: 0,
  INITIATED: 1,
  INITIATION_REPORTED: 1,
  WAITING_FOR_CONFIRMATIONS: 2,
  READY_TO_CLAIM: 3,
  WAITING_FOR_CLAIM_CONFIRMATIONS: 3,
  GET_REFUND: 3,
  WAITING_FOR_REFUND_CONFIRMATIONS: 3,
  REFUNDED: 4,
  SUCCESS: 4,
  READY_TO_SEND: 4
}

export default {
  components: {
    NavBar,
    CompletedIcon,
    SpinnerIcon,
    CopyIcon
  },
  data () {
    return {
      advanced: false,
      secretHidden: true,
      timeline: []
    }
  },
  props: ['id'],
  computed: {
    ...mapGetters(['client']),
    ...mapState(['activeWalletId', 'activeNetwork', 'balances', 'history']),
    item () {
      return this.history[this.activeNetwork][this.activeWalletId]
        .find((item) => item.id === this.id)
    },
    status () {
      return ORDER_STATUS_LABEL_MAP[this.item.status]
    },
    reverseRate () {
      return BN(1).div(this.item.rate).dp(8)
    },
    orderLink () {
      return this.item.agent + '/api/swap/order/' + this.item.id + '?verbose=true'
    },
    fees () {
      const fees = []
      const fromChain = getChainFromAsset(this.item.from)
      const toChain = getChainFromAsset(this.item.to)
      fees.push({
        chain: fromChain,
        fee: this.item.fee,
        unit: cryptoassets[fromChain.toLowerCase()].fees.unit
      })
      if (toChain !== fromChain) {
        fees.push({
          chain: toChain,
          fee: this.item.claimFee,
          unit: cryptoassets[toChain.toLowerCase()].fees.unit
        })
      }
      return fees
    }
  },
  methods: {
    ...mapActions(['retrySwap']),
    getChainFromAsset,
    prettyBalance,
    prettyTime (timestamp) {
      return moment(timestamp).format('L, LT')
    },
    retry () {
      this.retrySwap({ order: this.item })
    },
    async copy (text) {
      await navigator.clipboard.writeText(text)
    },
    async getTransaction (hash, asset) {
      const client = this.client(this.activeNetwork, this.activeWalletId, asset)
      const transaction = await client.chain.getTransactionByHash(hash)
      transaction.explorerLink = getExplorerLink(hash, asset, this.activeNetwork)
      transaction.asset = asset
      return transaction
    },
    async getInitiationStep (completed) {
      const step = {
        side: 'left',
        completed: completed,
        title: completed ? `Locked ${this.item.from}` : `Locking ${this.item.from}`
      }
      if (completed) {
        const tx = await this.getTransaction(this.item.fromFundHash, this.item.from)
        step.tx = tx || { hash: this.item.fromFundHash }
      }
      return step
    },
    async getAgentInitiationStep (completed) {
      const step = {
        side: 'right',
        completed: completed,
        title: completed ? `Locked ${this.item.to}` : `Awaiting ${this.item.to}`
      }
      if (completed) {
        if (this.item.toFundHash) {
          const tx = await this.getTransaction(this.item.toFundHash, this.item.to)
          step.tx = tx || { hash: this.item.toFundHash }
        } else {
          step.title = `No ${this.item.to} Locked`
          step.completed = false
        }
      }
      return step
    },
    async getClaimRefundStep (completed) {
      const step = {
        side: 'left',
        completed: completed,
        title: `Confirming ${this.item.to}`
      }
      if (completed) {
        const isRefund = this.item.refundHash
        if (isRefund) {
          const tx = await this.getTransaction(this.item.refundHash, this.item.from)
          step.title = `Refunded ${this.item.from}`
          step.tx = tx || { hash: this.item.refundHash }
        } else if (this.item.toClaimHash) {
          const tx = await this.getTransaction(this.item.toClaimHash, this.item.to)
          step.title = `Claimed ${this.item.to}`
          step.tx = tx || { hash: this.item.toClaimHash }
        }
      }
      return step
    },
    async getClaimRefundConfirmationStep (completed) {
      const step = {
        side: 'right',
        completed: completed,
        title: ''
      }
      if (!completed) {
        const isRefund = this.item.refundHash
        step.title = isRefund ? 'Confirming Refund' : 'Confirming Claim'
      }
      return step
    },
    async updateTransactions () {
      const timeline = []

      const steps = [
        this.getInitiationStep,
        this.getAgentInitiationStep,
        this.getClaimRefundStep,
        this.getClaimRefundConfirmationStep
      ]

      for (let i = 0; i < steps.length; i++) {
        const completed = STEPS[this.item.status] > i
        if (STEPS[this.item.status] >= i) {
          timeline.push(await steps[i](completed))
        }
      }

      this.timeline = timeline
    }
  },
  created () {
    this.updateTransactions()
    setInterval(() => this.updateTransactions(), 5000)
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

      &.completed::after {
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
</style>
