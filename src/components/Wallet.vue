<template>
  <div>
    <TradeModal
      v-if="buyCoin"
      :key="'trade:' + buyCoin"
      :coin="buyCoin"
      :balance="balance"
      :prefill="prefill"
      :marketData="marketData"
      @buy="buy"
      @close="buyCoin = null" />
    <WalletModal
      v-if="selectedWallet"
      :key="'wallet:' + selectedWallet"
      :wallet="selectedWallet"
      :address="address[selectedWallet]"
      :balance="balance[selectedWallet]"
      @close="selectedWallet = null"
      @refresh="updateBalance([selectedWallet]); selectedWallet = null" />
    <div class="table-responsive mb-4">
      <table class="table bg-white border mb-0">
        <thead>
          <tr>
            <td scope="col" class="text-muted">#</td>
            <td scope="col" class="text-muted">Asset</td>
            <td scope="col" class="text-muted text-right">Balance</td>
            <td scope="col" class="text-muted text-right cursor-pointer" @click="toggleBase">Rate</td>
            <td scope="col" class="text-muted text-center">Trade</td>
          </tr>
        </thead>
        <tbody class="font-weight-normal">
          <tr v-for="(coin, idx) in supportedCoins" :key="coin">
            <td scope="row" class="text-muted font-weight-light">{{idx + 1}}</td>
            <td class="cursor-pointer nowrap" @click="openWallet(coin)">
              <span class="asset-icon" :style="'background-image: url(/img/' + coin.toLowerCase() + '.png)'"> </span>
              <span>{{coin}}</span>
            </td>
            <td class="text-right cursor-pointer" @click="openWallet(coin)">
              <span v-if="balance[coin] !== null && balance[coin] !== undefined">
                {{dpUI(balance[coin], coin)}} <small class="text-muted">{{coin}}</small>
              </span>
              <Pacman class="mr-3" v-else />
            </td>
            <td class="text-right">
              <span v-if="marketData[coin]">
                <span v-if="base === coin">1 <small class="text-muted">{{coin}}</small></span>
                <span v-else>{{dpUI(marketData[coin][base].buyRate, coin)}} <small class="text-muted">{{base}}</small></span>
              </span>
              <Pacman class="mr-3" v-else />
            </td>
            <td class="nowrap">
              <button class="btn btn-lg btn-primary" @click="buyCoin = coin" :disabled="!marketData[coin]">Buy</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <History />
  </div>
</template>

<script>
// import axios from 'axios'
import { random } from 'lodash-es'
import { mapState } from 'vuex'
import { sha256 } from '@liquality/crypto'
import cryptoassets from '@liquality/cryptoassets'

import Pacman from '@/components/Pacman'
import History from '@/components/History'
import WalletModal from '@/components/WalletModal'
import TradeModal from '@/components/TradeModal'
import client from '@/utils/client'
import agent from '@/utils/agent'
// import market from '@/utils/market'
import { dpUI } from '@/utils/coinFormatter'
// import agents from '@/utils/agents'

export default {
  components: {
    TradeModal,
    WalletModal,
    History,
    Pacman
  },
  data () {
    return {
      balance: {},
      address: {},
      selectedWallet: null,
      buyCoin: false,
      prefill: {},
      supportedCoins: [
        'BTC',
        'ETH'
      ],
      marketData: {},
      base: 'BTC'
    }
  },
  computed: {
    ...mapState(['orders']),
    latestOrders () {
      return this.orders.slice().reverse()
    }
  },
  methods: {
    toggleBase () {
      this.base = this.supportedCoins.find(coin => coin !== this.base)
    },
    openWallet (coin) {
      if (this.balance[coin] === null || this.balance[coin] === undefined) return

      this.selectedWallet = coin
    },
    dpUI,
    updateBalance (coins) {
      coins
        .map(asset => {
          this.balance[asset] = null

          return asset
        })
        .map(asset => {
          client(asset)('wallet.getUsedAddresses', 'Addresses')().then(addresses => {
            client(asset)('chain.getBalance', 'BigNumber')(addresses).then(balance => {
              this.balance[asset] = cryptoassets[asset.toLowerCase()].unitToCurrency(balance)
            })
          })
        })
    },
    async buy ({ agentIndex, from, to, amount }) {
      const fromAmount = cryptoassets[from.toLowerCase()].currencyToUnit(amount)

      await this.swap(agentIndex, from, to, fromAmount)

      this.buyCoin = null
    },
    async getUnusedAddresses (coins) {
      return Promise.all(coins.map(coin => {
        return client(coin)('wallet.getUnusedAddress', 'Address')().then(address => {
          this.address[coin] = address

          return address
        })
      }))
    },
    checkOrderHistory () {
      this.orders.forEach(order => {
        if (!order.status) return
        if (['quote', 'success'].includes(order.status.toLowerCase())) return

        this.performNextAction(order)
      })
    },
    async performNextAction (order) {
      if (!order.status) return

      if (order.status.toLowerCase() === 'quote') {
        const [fromAddress, toAddress] = await this.getUnusedAddresses([order.from, order.to])

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

        await agent('updateOrder')(order.agentIndex, order.id, {
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

        this.updateBalance([order.to, order.from])
      }
    },
    async swap (agentIndex, from, to, fromAmount) {
      const order = await agent('newOrder')(agentIndex, {
        from,
        to,
        fromAmount
      })

      order.agentIndex = agentIndex
      order.startTime = Date.now()
      order.status = 'Quote'

      this.$store.commit('NEW_ORDER', order)

      this.performNextAction(order)
    }
  },
  async created () {
    const { hash } = window.location

    this.prefill = hash.replace('#', '').split('&').reduce((acc, query) => {
      const parts = query.split('=')

      if (parts[0] === 'pair') {
        parts[1] = parts[1].split('_')
        parts[1] = {
          from: parts[1][0],
          to: parts[1][1]
        }
      }

      acc[parts[0]] = parts[1]
      return acc
    }, {})

    this.marketData = await agent('market')(this.supportedCoins)

    this.supportedCoins.map(coin => {
      this.$set(this.balance, coin, null)
      this.$set(this.address, coin, null)
    })

    this.updateBalance(this.supportedCoins)
    this.getUnusedAddresses(this.supportedCoins)
    this.checkOrderHistory()
  }
}
</script>

<style lang="scss">
.balance-box {
  .card + .card {
    margin-left: 1.5rem;
  }

  @media (max-width: 768px) {
    flex-direction: column;

    .card + .card {
      margin-left: 0!important;
      margin-top: 1.5rem!important;
    }
  }
}

.asset-icon {
  display: inline-block;
  vertical-align: middle;
  height: 30px;
  width: 30px;
  margin-right: 10px;
  background-position: center center;
  background-repeat: no-repeat;
  background-size: contain;
  transform-origin: center;
  transition: all 0.2s ease-out;

  & + span {
    vertical-align: middle;
  }
}
</style>
