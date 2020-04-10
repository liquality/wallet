<template>
  <div>
    <TradeModal
      v-if="selectedMarket"
      :market="selectedMarket"
      :balance="balance"
      @sell="sell"
      @close="selectedMarket = null" />
    <OrderModal
      v-if="selectedOrder"
      :order="selectedOrder"
      @close="selectedOrder = null" />
    <div class="d-flex mb-4 balance-box">
      <div class="card card-up cursor-pointer" @click="updateBalance">
        <div class="card-body">
          <h1 class="h4 d-flex align-items-center justify-content-between"><span>BTC</span> <small class="ml-2 text-muted font-weight-light">testnet3</small></h1>
          <h2 class="h2 font-weight-light mt-3 mb-3">{{ balance.btc }}</h2>
          <h3 class="h6 mb-0 font-weight-light text-muted">{{ address.btc }}</h3>
        </div>
      </div>
      <div class="card card-up cursor-pointer ml-4" @click="updateBalance">
        <div class="card-body">
          <h1 class="h4 d-flex align-items-center justify-content-between"><span>ETH</span> <small class="ml-2 text-muted font-weight-light">rinkeby</small></h1>
          <h2 class="h2 font-weight-light mt-3 mb-3">{{ balance.eth }}</h2>
          <h3 class="h6 mb-0 font-weight-light text-muted">0x{{ address.eth }}</h3>
        </div>
      </div>
    </div>
    <div class="table-responsive">
      <table class="table bg-white border mb-4">
        <thead>
          <tr>
            <td scope="col" class="text-muted">#</td>
            <td scope="col" class="text-muted">Pair</td>
            <td scope="col" class="text-muted">Rate</td>
            <td scope="col" class="text-muted">Trade</td>
          </tr>
        </thead>
        <tbody class="font-weight-normal">
          <tr v-if="marketinfo.length === 0">
            <td colspan="4" class="text-center font-weight-light text-muted">Fetching market data...</td>
          </tr>
          <tr v-for="(market, idx) in marketinfo" :key="market.to + '-' + market.from">
            <td scope="row" class="text-muted font-weight-light">{{idx + 1}}</td>
            <td class="nowrap">{{market.from}} <small class="text-muted">/ {{market.to}}</small></td>
            <td><small class="text-muted">1 {{market.from}} =</small> {{market.rate}} <small class="text-muted">{{market.to}}</small></td>
            <td><button class="btn btn-block btn-lg btn-primary" @click="selectedMarket = market">Sell {{market.from}}</button></td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="table-responsive">
      <table class="table border bg-white">
        <thead>
          <tr>
            <td scope="col" class="text-muted">#</td>
            <td scope="col" class="text-muted">Description</td>
            <td scope="col" class="text-muted">Rate</td>
            <td scope="col" class="text-muted text-center">Progress</td>
            <td scope="col" class="text-muted text-center">Status</td>
          </tr>
        </thead>
        <tbody class="font-weight-normal">
          <tr v-if="latestOrders.length === 0">
            <td colspan="6" class="text-center font-weight-light text-muted">No previous orders found</td>
          </tr>
          <tr v-for="(order, idx) in latestOrders" :key="order.id" @click="selectedOrder = order" class="cursor-pointer">
            <td scope="row" class="text-muted font-weight-light">{{orders.length - idx}}</td>
            <td class="nowrap">+{{prettyAmount(order.to, order.toAmount)}} <small class="text-muted">{{order.to}} / -{{prettyAmount(order.from, order.fromAmount)}} {{order.from}}</small></td>
            <td><small class="text-muted">1 {{order.from}} =</small> {{order.rate}} <small class="text-muted">{{order.to}}</small></td>
            <td class="text-center">
              <button class="btn btn-block btn-link text-muted">
                <span v-if="order.status.toLowerCase() !== 'success'">
                  {{getOrderProgress(order)}}/5
                  <Pacman class="d-inline-block mr-3 ml-2" />
                </span>
                <span v-else>Finished in {{getOrderDuration(order)}}</span>
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
import axios from 'axios'
import { differenceInMinutes, differenceInSeconds } from 'date-fns'
import { random } from 'lodash-es'
import { mapState } from 'vuex'
import { sha256 } from '@liquality/crypto'
import cryptoassets from '@liquality/cryptoassets'

import TradeModal from '@/components/TradeModal'
import OrderModal from '@/components/OrderModal'
import Pacman from '@/components/Pacman'
import client from '@/utils/client'

const agent = `${process.env.NODE_ENV !== 'production' ? 'http://localhost:8010/proxy' : '/api'}/swap-testnet-dev/agent/api/swap`

function newOrder (data) {
  return axios({
    url: agent + '/order',
    method: 'post',
    data
  }).then(res => res.data)
}

function updateOrder (id, data) {
  return axios({
    url: agent + '/order/' + id,
    method: 'post',
    data
  }).then(res => res.data)
}

function getMarketInfo (id, data) {
  return axios({
    url: agent + '/marketinfo'
  }).then(res => res.data)
}

const ORDER_STATUS_MAP = {
  quote: 1,
  secured: 2,
  initiated: 3,
  exchanging: 4,
  success: 5
}

export default {
  components: {
    Pacman,
    TradeModal,
    OrderModal
  },
  data () {
    return {
      balance: {
        btc: '...',
        eth: '...'
      },
      address: {
        btc: '...',
        eth: '...'
      },
      marketinfo: [],
      selectedMarket: null,
      selectedOrder: null
    }
  },
  computed: {
    ...mapState(['orders']),
    latestOrders () {
      return this.orders.slice().reverse()
    }
  },
  methods: {
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
    async updateMarket () {
      this.marketinfo = (await getMarketInfo()).filter(market => ['ETH', 'BTC'].includes(market.to) && ['ETH', 'BTC'].includes(market.from))

      setTimeout(() => {
        this.updateMarket()
      }, random(15000, 30000))
    },
    updateBalance (firstTime) {
      Object
        .keys(this.balance)
        .filter(asset => firstTime === true || this.balance[asset] !== '...')
        .map(asset => {
          this.balance[asset] = '...'

          return asset
        })
        .map(asset => {
          client(asset)('wallet.getUsedAddresses', 'Addresses')().then(addresses => {
            client(asset)('chain.getBalance', 'BigNumber')(addresses).then(balance => {
              this.balance[asset] = cryptoassets[asset].unitToCurrency(balance)
            })
          })
        })
    },
    prettyAmount (chain, amount) {
      return cryptoassets[chain.toLowerCase()].unitToCurrency(amount)
    },
    async sell ({ from, to, amount }) {
      const fromAmount = cryptoassets[from.toLowerCase()].currencyToUnit(amount)

      await this.swap(from, to, fromAmount)

      this.selectedMarket = null
    },
    async getUnusedAddresses (order) {
      const [fromAddress, toAddress] = await Promise.all([
        client(order.from)('wallet.getUnusedAddress', 'Address')(),
        client(order.to)('wallet.getUnusedAddress', 'Address')()
      ])

      this.address[order.to.toLowerCase()] = toAddress
      this.address[order.from.toLowerCase()] = fromAddress

      return [fromAddress, toAddress]
    },
    checkOrderHistory () {
      this.orders.forEach(order => {
        if (!order.status) return
        if (['quote', 'success'].includes(order.status.toLowerCase())) return

        console.log('Continuing', order.id, order.status)

        this.performNextAction(order)
      })
    },
    async performNextAction (order) {
      if (!order.status) return

      if (order.status.toLowerCase() === 'quote') {
        const [fromAddress, toAddress] = await this.getUnusedAddresses(order)

        const secret = await client(order.from)('swap.generateSecret')('test')
        const secretHash = sha256(secret)

        order = {
          ...order,
          secret,
          fromAddress,
          toAddress,
          secretHash,
          status: 'Secured'
        }

        this.$store.commit('UPDATE_ORDER', order)

        this.performNextAction(order)
      } else if (order.status.toLowerCase() === 'secured') {
        const fromFundHash = await client(order.from)('swap.initiateSwap')(
          order.fromAmount,
          order.fromCounterPartyAddress,
          order.fromAddress,
          order.secretHash,
          order.swapExpiration
        )

        order = {
          ...order,
          fromFundHash,
          status: 'Initiated'
        }

        await updateOrder(order.id, {
          fromAddress: order.fromAddress,
          toAddress: order.toAddress,
          fromFundHash: order.fromFundHash,
          secretHash: order.secretHash
        })

        this.$store.commit('UPDATE_ORDER', order)

        this.performNextAction(order)
      } else if (order.status.toLowerCase() === 'initiated') {
        const interval = setInterval(async () => {
          const tx = await client(order.to)('swap.findInitiateSwapTransaction')(
            order.toAmount, order.toAddress, order.toCounterPartyAddress, order.secretHash, order.nodeSwapExpiration
          )

          if (tx) {
            clearInterval(interval)

            const toFundHash = tx.hash

            order = {
              ...order,
              toFundHash,
              status: 'Exchanging'
            }

            this.$store.commit('UPDATE_ORDER', order)

            this.performNextAction(order)
          }
        }, random(15000, 30000))
      } else if (order.status.toLowerCase() === 'exchanging') {
        const toClaimHash = await client(order.to)('swap.claimSwap')(
          order.toFundHash,
          order.toAddress,
          order.toCounterPartyAddress,
          order.secret,
          order.nodeSwapExpiration
        )

        order = {
          ...order,
          status: 'Success',
          endTime: Date.now(),
          toClaimHash
        }

        this.$store.commit('UPDATE_ORDER', order)

        this.updateBalance()
      }
    },
    async swap (from, to, fromAmount) {
      const order = await newOrder({
        from,
        to,
        fromAmount
      })

      order.startTime = Date.now()
      order.status = 'Quote'

      this.$store.commit('NEW_ORDER', order)

      this.performNextAction(order)
    }
  },
  async created () {
    this.updateMarket()
    this.updateBalance(true)
    this.getUnusedAddresses({ to: 'BTC', from: 'ETH' })
    this.checkOrderHistory()
  }
}
</script>

<style lang="scss">
button {
  code, pre {
    color: inherit;
  }
}
.text-muted, .text-white {
  code, pre {
    color: inherit;
  }
}
.btn {
  text-align: left!important;
}
.card-body {
  .mb-2:last-child {
    margin-bottom: 0!important;
  }
}

.form-control {
  border-top: 0;
  border-left: 0;
  border-right: 0;
  border-radius: 0;
  outline: 0;
  box-shadow: none;
  padding: 0;

  &[readonly] {
    background: white;
  }

  &:hover, &:focus, &:active {
    outline: 0;
    box-shadow: none;
  }
}

.table {
  font-size: 1rem;

  th, td {
    vertical-align: middle!important;
  }

  thead > tr {
    td {
      border: 0;
    }
  }

  tr {
    > td:first-child, > td:nth-child(3), > td:nth-child(4), > td:nth-child(5) {
      width: 1%;
      white-space: nowrap;
    }
  }
}

td > .badge {
  text-align: center;
  font-weight: 400;
  padding: 0.5rem;
  width: 100%;
}

td > .btn {
  text-align: center!important;
}

.btn {
  font-weight: 400!important;
}

.card-up {
  will-change: transform;
  transition: transform 0.2s;

  &:hover {
    transform: translate(0, -5px);
  }
}

.cursor-pointer {
  cursor: pointer;
}

.btn-link {
  padding-left: 0!important;
  padding-right: 0!important;

  &:hover, &:focus, &:active {
    text-decoration: none!important;
  }
}

.nowrap {
  white-space: nowrap;
}

.balance-box.d-flex {
  @media (max-width: 768px) {
    flex-direction: column;

    .card + .card {
      margin-top: 1.5rem!important;
    }

    .card.ml-4 {
      margin-left: 0!important;
    }
  }
}
</style>
