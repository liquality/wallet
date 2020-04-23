<template>
  <Modal @close="close">
    <div class="modal-body modal-body-trade">
      <div :class="{
        'modal-cover': true,
        'modal-cover-flat': qrcode
      }">
        <div v-if="qrcode">
          <p class="text-center mb-0"><span class="bold-label text-white word-break-all">Waiting for {{amount}} {{payCoin}}</span></p>
          <div v-html="qrcode" class="mb-2" />

          <p class="font-weight-light mb-0 text-center word-break-all">0x{{address[payCoin]}}</p>
        </div>
        <div v-else>
          <h2 class="h4 mb-0 bold-label text-white d-flex justify-content-between align-items-center">
            <span>You deposit</span>
            <small v-if="bestMarketBasedOnAmount">
              <span class="cursor-pointer" @click="setAmount(sellMin)">Min</span> &mdash; <span class="cursor-pointer" @click="setAmount(sellMax)">Max</span>
            </small>
          </h2>

          <div class="input-group input-group-lg mt-1 mb-0">
            <input type="number" class="form-control simple" v-model="amount" step="0.0001" :readonly="loading">
            <div class="input-group-append">
              <span class="input-group-text">{{payCoin}}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="bestMarketBasedOnAmount">
        <p class="mb-2 d-flex justify-content-between align-items-center">
          <span class="bold-label text-primary">Rate</span>
          <span>
            <small class="text-muted">1 {{payCoin}} = </small>
            <span class="font-weight-normal">{{dpUI(bestSellRateBasedOnAmount, coin)}} </span>
            <small class="text-muted">{{coin}}</small>
          </span>
        </p>

        <p class="mb-2 d-flex justify-content-between align-items-center">
          <span class="bold-label text-primary">You get</span>
          <span>
            <span class="font-weight-normal">{{youGet}} </span>
            <small class="text-muted">{{coin}}</small>
          </span>
        </p>

        <div>
          <p class="mb-0 d-flex justify-content-between align-items-center cursor-pointer" @click="sendToToggle">
            <span class="bold-label text-primary">Send {{coin}} to</span>
            <span v-if="!enterToAddress">
              <span class="text-muted">self</span>
            </span>
          </p>
          <div v-if="enterToAddress">
            <input type="text" class="form-control simple mb-0" v-model="sendTo">
          </div>
        </div>

        <div class="text-center mt-3" v-if="qrcode">
          <Pacman class="d-inline-block mr-3" />
        </div>
      </div>
      <div v-else>
        <p class="mb-2 d-flex justify-content-between align-items-center cursor-pointer" @click="setAmount(sellMin)">
          <span class="bold-label text-primary">Min</span>
          <span>
            <span class="font-weight-normal">{{sellMin}} </span>
            <small class="text-muted">{{payCoin}}</small>
          </span>
        </p>
        <p class="mb-0 d-flex justify-content-between align-items-center cursor-pointer" @click="setAmount(sellMax)">
          <span class="bold-label text-primary">Max</span>
          <span>
            <span class="font-weight-normal">{{sellMax}} </span>
            <small class="text-muted">{{payCoin}}</small>
          </span>
        </p>
      </div>

      <button
        v-if="!qrcode"
        :class="{
          'text-center btn btn-lg btn-block mt-3': true,
          'btn-light': loading,
          'btn-primary': !loading
        }"
        :disabled="!bestMarketBasedOnAmount || !canBuy || loading"
        @click="next">
        <span v-if="!loading">Continue</span>
        <Pacman v-else class="d-inline-block mr-3" />
      </button>
    </div>
  </Modal>
</template>

<script>
import { mapGetters } from 'vuex'
import { random } from 'lodash-es'
import BN from 'bignumber.js'
import QRCode from 'qrcode'
import cryptoassets from '@liquality/cryptoassets'

import { dpUI } from '@/utils/coinFormatter'

import Pacman from '@/components/Pacman'
import Modal from '@/components/Modal'

export default {
  components: {
    Modal,
    Pacman
  },
  data () {
    return {
      amount: 0,
      loading: false,
      payCoin: null,
      enterToAddress: false,
      sendTo: null,
      qrcode: null
    }
  },
  props: {
    coin: String,
    market: Object,
    marketData: Object,
    balance: Object,
    address: Object
    // prefill: Object
  },
  created () {
    this.payCoin = Object.keys(this.selectedMarket)[0]
    this.amount = this.sellMin
  },
  computed: {
    ...mapGetters(['client']),
    bestAgentIndex () {
      return this.bestMarketBasedOnAmount.agentIndex
    },
    bestSellRateBasedOnAmount () {
      return this.bestMarketBasedOnAmount.sellRate
    },
    bestMarketBasedOnAmount () {
      return this.payMarket.markets.find(market => {
        const sellAmount = BN(this.amount)

        return BN(market.sellMin).lte(sellAmount) && BN(market.sellMax).gte(sellAmount)
      })
    },
    buyMin () {
      return dpUI(BN(this.payMarket.sellMin).times(this.payMarket.sellRate), this.coin)
    },
    buyMax () {
      return dpUI(BN(this.payMarket.sellMax).times(this.payMarket.sellRate), this.coin, true)
    },
    sellMin () {
      return dpUI(BN(this.payMarket.sellMin).plus(0.001), this.coin)
    },
    sellMax () {
      return dpUI(this.payMarket.sellMax, this.coin, true)
    },
    safeAmount () {
      return this.amount || 0
    },
    payMarket () {
      return this.selectedMarket[this.payCoin]
    },
    selectedMarket () {
      return this.marketData[this.coin]
    },
    canBuy () {
      const amount = BN(this.safeAmount)

      if (amount.gt(this.sellMax) || amount.lt(this.sellMin)) return false

      return true
    },
    youGet () {
      return dpUI(BN(this.safeAmount).times(this.bestSellRateBasedOnAmount), this.coin)
    }
  },
  methods: {
    close () {
      if (this.qrcode) return
      this.$emit('close')
    },
    sendToToggle () {
      if (this.qrcode) return

      this.sendTo = null
      this.enterToAddress = !this.enterToAddress
    },
    async next () {
      const amount = cryptoassets[this.payCoin.toLowerCase()].currencyToUnit(this.amount)

      QRCode.toString(`ethereum:0x${this.address[this.payCoin]}?value=${amount}`, {
        type: 'svg',
        color: {
          dark: '#fff',
          light: '#5665c2'
        }
      }, (err, svg) => {
        if (err) throw err

        this.qrcode = svg
      })

      const balance = await this.client(this.payCoin)('chain.getBalance', 'BigNumber')([this.address[this.payCoin]])
      const minBalance = BN(balance).plus(amount)
      this.checkForBalance(minBalance)
    },
    async checkForBalance (minBalance) {
      const balance = await this.client(this.payCoin)('chain.getBalance', 'BigNumber')([this.address[this.payCoin]])

      if (BN(balance).gte(minBalance)) {
        this.$emit('buy', {
          agentIndex: this.bestAgentIndex,
          from: this.payCoin,
          to: this.coin,
          amount: BN(this.amount).minus(0.001),
          sendTo: this.sendTo,
          auto: true
        })
      } else {
        setTimeout(this.checkForBalance, random(15000, 30000), minBalance)
      }
    },
    dpUI,
    setAmount (amount) {
      if (this.loading) return

      this.amount = amount
    }
  }
}
</script>

<style lang="scss">
.modal-body-trade {
  select {
    border: 2px solid hsl(212, 33%, 89%)!important;
    font-weight: 400;
  }
}

input.simple {
  font-size: 1.4rem!important;
  font-weight: 400;
  outline: none;
  box-shadow: none;

  &[readonly] {
    background: transparent;
  }

  &:hover, &:focus, &:active {
    outline: none;
    box-shadow: none;
  }

  &[type="number"] {
    -moz-appearance: textfield;
  }

  &[type="number"]::-webkit-inner-spin-button,
  &[type="number"]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
}
</style>
