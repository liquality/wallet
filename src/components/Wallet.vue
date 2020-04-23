<template>
  <div>
    <AutoModal
      v-if="autoCoin"
      :key="'quick:' + autoCoin"
      :coin="autoCoin"
      :balance="balance"
      :address="address"
      :marketData="marketData"
      @buy="buy"
      @close="autoCoin = null" />
    <TradeModal
      v-if="buyCoin"
      :key="'trade:' + buyCoin"
      :coin="buyCoin"
      :balance="balance"
      :marketData="marketData"
      @buy="buy"
      @close="buyCoin = null"
      @autoBuy="autoBuy" />
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
              <span class="asset-icon" :style="'background-image: url(./img/' + coin.toLowerCase() + '.png)'"> </span>
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
    <History :waiting="waiting" />
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import { random } from 'lodash-es'
import { sha256 } from '@liquality/crypto'
import cryptoassets from '@liquality/cryptoassets'

import Pacman from '@/components/Pacman'
import History from '@/components/History'
import WalletModal from '@/components/WalletModal'
import TradeModal from '@/components/TradeModal'
import AutoModal from '@/components/AutoModal'
import { dpUI } from '@/utils/coinFormatter'
import { EventBus } from '@/utils/event-bus'

export default {
  components: {
    TradeModal,
    WalletModal,
    History,
    Pacman,
    AutoModal
  },
  data () {
    return {
      balance: {},
      address: {},
      selectedWallet: null,
      buyCoin: false,
      autoCoin: false,
      // prefill: {},
      marketData: {},
      base: 'BTC',
      waiting: {}
    }
  },
  computed: {
    ...mapState(['orders', 'isTestnet']),
    ...mapGetters(['client', 'agent']),
    walletId () {
      return this.$route.params.walletId
    },
    walletOrders () {
      return this.orders.filter(order => order.walletId === this.walletId)
    },
    supportedCoins () {
      const coins = ['BTC', 'ETH']
      return this.isTestnet ? coins : coins.concat(['DAI', 'USDC'])
    }
  },
  methods: {
    async autoBuy () {
      const temp = this.buyCoin
      this.buyCoin = false
      this.autoCoin = temp
    },
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
        .map(async asset => {
          const addresses = await this.client(asset)('wallet.getUsedAddresses', 'Addresses')()
          const balance = await this.client(asset)('chain.getBalance', 'BigNumber')(addresses)

          this.balance[asset] = cryptoassets[asset.toLowerCase()].unitToCurrency(balance)
        })
    },
    async buy ({ agentIndex, from, to, amount, sendTo, auto }) {
      const fromAmount = cryptoassets[from.toLowerCase()].currencyToUnit(amount)

      await this.swap(agentIndex, from, to, fromAmount, sendTo, auto)

      this.autoCoin = null
      this.buyCoin = null
    },
    async getUnusedAddresses (coins) {
      return Promise.all(coins.map(coin => {
        return this.client(coin)('wallet.getUnusedAddress', 'Address')().then(address => {
          this.address[coin] = address

          return address
        })
      }))
    },
    checkOrderHistory () {
      this.walletOrders.forEach(order => {
        if (!order.status) return
        if (['quote', 'success', 'refunded', 'quote expired'].includes(order.status.toLowerCase())) return

        this.performNextAction(order)
      })
    },
    async waitFor (min, max) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve()
        }, random(min, max))
      })
    },
    async getLockForChain (order, chain) {
      if (!this.chainLock[chain]) {
        this.chainLock[chain] = true

        await this.waitFor(5000, 8500)
        this.waiting[order.id] = false
        return
      }

      this.waiting[order.id] = true

      await new Promise((resolve, reject) => {
        EventBus.$once(`unlock:${chain}`, () => resolve())
      })

      await this.getLockForChain(order, chain)
    },
    async unlockChain (chain) {
      this.chainLock[chain] = false
      EventBus.$emit(`unlock:${chain}`)
    },
    timestamp () {
      return Math.ceil(Date.now() / 1000)
    },
    checkIfQuoteExpired (order) {
      if (this.timestamp() >= order.expiresAt) {
        order = {
          ...order,
          status: 'Quote Expired'
        }

        this.$store.commit('UPDATE_ORDER', order)

        return true
      }
    },
    checkIfSwapHasExpired (order) {
      if (this.timestamp() >= order.nodeSwapExpiration) {
        order = {
          ...order,
          status: 'Getting Refund'
        }

        this.$store.commit('UPDATE_ORDER', order)

        return true
      }
    },
    async performNextAction (order) {
      if (!order.status) return

      if (order.status.toLowerCase() === 'quote') {
        const [fromAddress, toAddress] = await this.getUnusedAddresses([order.from, order.to])

        const message = [
          'Creating a swap with following terms:',
          `Send: ${order.fromAmount} (lowest denomination) ${order.from}`,
          `Receive: ${order.toAmount} (lowest denomination) ${order.to}`,
          `My ${order.from} Address: ${fromAddress}`,
          `My ${order.to} Address: ${toAddress}`,
          `Counterparty ${order.from} Address: ${order.fromCounterPartyAddress}`,
          `Counterparty ${order.to} Address: ${order.toCounterPartyAddress}`,
          `Timestamp: ${Date.now()}`
        ].join('\n')

        const secret = await this.client(order.from)('swap.generateSecret')(Buffer.from(message, 'utf8').toString('hex'))
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
        if (this.checkIfQuoteExpired(order)) return

        await this.getLockForChain(order, order.from)
        const fromFundHash = await this.client(order.from)('swap.initiateSwap')(
          order.fromAmount,
          order.fromCounterPartyAddress,
          order.fromAddress,
          order.secretHash,
          order.swapExpiration
        )
        await this.unlockChain(order.from)

        order = {
          ...order,
          fromFundHash,
          status: 'Initiated'
        }

        await this.agent('updateOrder')(order.agentIndex, order.id, {
          fromAddress: order.fromAddress,
          toAddress: order.toAddress,
          fromFundHash: order.fromFundHash,
          secretHash: order.secretHash
        })

        this.$store.commit('UPDATE_ORDER', order)

        this.performNextAction(order)
      } else if (['waiting for confirmations', 'initiated'].includes(order.status.toLowerCase())) {
        const interval = setInterval(async () => {
          if (this.checkIfSwapHasExpired(order)) {
            clearInterval(interval)

            this.performNextAction(order)

            return
          }

          const tx = await this.client(order.to)('swap.findInitiateSwapTransaction')(
            order.toAmount, order.toAddress, order.toCounterPartyAddress, order.secretHash, order.nodeSwapExpiration
          )

          if (tx) {
            const toFundHash = tx.hash

            if (tx.confirmations >= order.minConf) {
              clearInterval(interval)

              order = {
                ...order,
                toFundHash,
                status: 'Ready to Exchange'
              }

              this.$store.commit('UPDATE_ORDER', order)

              this.performNextAction(order)
            } else if (order.status.toLowerCase() === 'initiated') {
              order = {
                ...order,
                toFundHash,
                status: 'Waiting for Confirmations'
              }

              this.$store.commit('UPDATE_ORDER', order)
            }
          }
        }, random(15000, 30000))

        this.intervals.push(interval)
      } else if (['exchanging', 'ready to exchange'].includes(order.status.toLowerCase())) {
        await this.getLockForChain(order, order.to)
        const toClaimHash = await this.client(order.to)('swap.claimSwap')(
          order.toFundHash,
          order.toAddress,
          order.toCounterPartyAddress,
          order.secret,
          order.nodeSwapExpiration
        )
        await this.unlockChain(order.to)

        if (order.sendTo) {
          order = {
            ...order,
            status: 'Ready to Send',
            toClaimHash
          }

          this.$store.commit('UPDATE_ORDER', order)

          this.performNextAction(order)
        } else {
          order = {
            ...order,
            status: 'Success',
            endTime: Date.now(),
            toClaimHash
          }

          this.$store.commit('UPDATE_ORDER', order)

          this.updateBalance([order.to, order.from])
        }
      } else if (order.status.toLowerCase() === 'getting refund') {
        const diff = ((order.swapExpiration - this.timestamp()) + random(5, 10)) * 1000

        const refund = async () => {
          await this.getLockForChain(order, order.from)
          await this.client(order.from)('swap.refundSwap')(
            order.fromFundHash,
            order.fromCounterPartyAddress,
            order.fromAddress,
            order.secretHash,
            order.swapExpiration
          )
          await this.unlockChain(order.from)

          order = {
            ...order,
            status: 'Refunded',
            endTime: Date.now()
          }

          this.$store.commit('UPDATE_ORDER', order)

          this.updateBalance([order.to, order.from])
        }

        if (diff > 0) {
          this.timeouts.push(setTimeout(refund, diff))
        } else {
          await refund()
        }
      } else if (order.status.toLowerCase() === 'ready to send') {
        const sendTx = await this.client(order.to)('chain.sendTransaction')(order.sendTo, order.toAmount)

        order = {
          ...order,
          status: 'Success',
          endTime: Date.now(),
          sendTx: sendTx
        }

        this.$store.commit('UPDATE_ORDER', order)

        this.updateBalance([order.to, order.from])
      }
    },
    async swap (agentIndex, from, to, fromAmount, sendTo, auto) {
      const order = await this.agent('newOrder')(agentIndex, {
        from,
        to,
        fromAmount
      })

      order.agentIndex = agentIndex
      order.startTime = Date.now()
      order.status = 'Quote'
      order.sendTo = sendTo
      order.auto = auto
      order.walletId = this.walletId

      this.$store.commit('NEW_ORDER', order)

      this.performNextAction(order)
    },
    async updateMarketData () {
      this.marketData = await this.agent('market')(this.supportedCoins)

      this.timeouts.push(setTimeout(() => {
        this.updateMarketData()
      }, random(15000, 30000)))
    }
  },
  async created () {
    this.intervals = []
    this.timeouts = []

    this.chainLock = {}
    // const { hash } = window.location

    // this.prefill = hash.replace('#', '').split('&').reduce((acc, query) => {
    //   const parts = query.split('=')
    //
    //   if (parts[0] === 'pair') {
    //     parts[1] = parts[1].split('_')
    //     parts[1] = {
    //       from: parts[1][0],
    //       to: parts[1][1]
    //     }
    //   }
    //
    //   acc[parts[0]] = parts[1]
    //   return acc
    // }, {})

    this.supportedCoins.map(coin => {
      this.$set(this.balance, coin, null)
      this.$set(this.address, coin, null)
    })

    this.updateMarketData()
    this.updateBalance(this.supportedCoins)
    this.getUnusedAddresses(this.supportedCoins)
    this.checkOrderHistory()
  },
  beforeDestroy () {
    this.intervals.map(interval => clearInterval(interval))
    this.timeouts.map(timeout => clearTimeout(timeout))
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
