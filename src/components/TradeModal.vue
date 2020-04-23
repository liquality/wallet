<template>
  <Modal @close="$emit('close')">
    <div class="modal-body modal-body-trade">
      <div class="modal-cover">
        <h2 class="h4 mb-0 bold-label text-white d-flex justify-content-between align-items-center">
          <span>Buy</span>
          <small v-if="bestMarketBasedOnAmount">
            <span class="cursor-pointer" @click="setAmount(buyMin)">Min</span> &mdash; <span class="cursor-pointer" @click="setAmount(buyMax)">Max</span>
          </small>
        </h2>

        <div class="input-group input-group-lg mt-1 mb-0">
          <input type="number" class="form-control simple" v-model="amount" step="0.0001" :readonly="loading">
          <div class="input-group-append">
            <span class="input-group-text">{{coin}}</span>
          </div>
        </div>
      </div>

      <div v-if="bestMarketBasedOnAmount">
        <div class="mb-2">
          <p class="mb-0 d-flex justify-content-between align-items-center cursor-pointer" @click="sendTo = null; enterToAddress = !enterToAddress">
            <span class="bold-label text-primary">Send {{coin}} to</span>
            <span v-if="!enterToAddress">
              <span class="text-muted">self</span>
            </span>
          </p>
          <div v-if="enterToAddress">
            <input type="text" class="form-control simple mb-0" v-model="sendTo">
          </div>
        </div>

        <label class="bold-label text-primary">Pay using</label>
        <select class="form-control form-control-lg mb-3" v-model="payCoin">
          <option
            v-for="(data, payUsing) in marketData[coin]"
            :key="payUsing"
            :value="payUsing">{{dpUI(balance[payUsing], payUsing)}} {{payUsing}}</option>
        </select>

        <p class="mb-2 d-flex justify-content-between align-items-center">
          <span class="bold-label text-primary">Rate</span>
          <span>
            <small class="text-muted">1 {{coin}} = </small>
            <span class="font-weight-normal">{{dpUI(bestBuyRateBasedOnAmount, payCoin)}} </span>
            <small class="text-muted">{{payCoin}}</small>
          </span>
        </p>

        <p class="mb-3 d-flex justify-content-between align-items-center">
          <span class="bold-label text-primary">You pay</span>
          <span>
            <span class="font-weight-normal">{{youPay}} </span>
            <small class="text-muted">{{payCoin}}</small>
          </span>
        </p>
      </div>
      <div v-else>
        <p class="mb-2 d-flex justify-content-between align-items-center cursor-pointer" @click="setAmount(buyMin)">
          <span class="bold-label text-primary">Min</span>
          <span>
            <span class="font-weight-normal">{{buyMin}} </span>
            <small class="text-muted">{{coin}}</small>
          </span>
        </p>
        <p class="mb-3 d-flex justify-content-between align-items-center cursor-pointer" @click="setAmount(buyMax)">
          <span class="bold-label text-primary">Max</span>
          <span>
            <span class="font-weight-normal">{{buyMax}} </span>
            <small class="text-muted">{{coin}}</small>
          </span>
        </p>
      </div>

      <button
        :class="{
          'text-center btn btn-lg btn-block': true,
          'btn-light': loading,
          'btn-primary': !loading
        }"
        :disabled="!bestMarketBasedOnAmount || !canBuy || loading"
        @click="buy">
        <span v-if="!loading">Buy</span>
        <Pacman v-else class="d-inline-block mr-3" />
      </button>

      <p class="text-center small text-primary mb-0 mt-3 cursor-pointer" v-if="coin === 'BTC'" @click="$emit('autoBuy')">Auto buy &rsaquo;</p>
    </div>
  </Modal>
</template>

<script>
import BN from 'bignumber.js'

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
      sendTo: null
    }
  },
  props: {
    coin: String,
    market: Object,
    marketData: Object,
    balance: Object
    // prefill: Object
  },
  created () {
    this.payCoin = Object.keys(this.selectedMarket)[0]
    this.amount = this.buyMin

    // if (this.prefill.amount) {
    //   this.amount = this.prefill.amount
    // } else {
    //   this.amount = this.buyMin
    // }
  },
  computed: {
    bestAgentIndex () {
      return this.bestMarketBasedOnAmount.agentIndex
    },
    bestBuyRateBasedOnAmount () {
      return this.bestMarketBasedOnAmount.buyRate
    },
    bestSellRateBasedOnAmount () {
      return this.bestMarketBasedOnAmount.sellRate
    },
    bestMarketBasedOnAmount () {
      return this.payMarket.markets.find(market => {
        const sellAmount = BN(this.amount).div(market.sellRate)

        return BN(market.sellMin).lte(sellAmount) && BN(market.sellMax).gte(sellAmount)
      })
    },
    buyMin () {
      return dpUI(BN(this.payMarket.sellMin).times(this.payMarket.sellRate), this.coin)
    },
    buyMax () {
      return dpUI(BN(this.payMarket.sellMax).times(this.payMarket.sellRate), this.coin, true)
    },
    safeAmount () {
      return this.amount || 0
    },
    payMarket () {
      return this.selectedMarket[this.payCoin]
    },
    payBalance () {
      return this.balance[this.payCoin]
    },
    selectedMarket () {
      return this.marketData[this.coin]
    },
    canBuy () {
      const amount = BN(this.safeAmount)
      const youPay = BN(this.youPay)

      if (amount.gt(this.buyMax) || amount.lt(this.buyMin) || youPay.gt(this.payBalance)) return false

      return true
    },
    youPay () {
      return dpUI(BN(this.safeAmount).div(this.bestSellRateBasedOnAmount), this.payCoin)
    }
  },
  methods: {
    dpUI,
    buy () {
      this.loading = true

      this.$emit('buy', {
        agentIndex: this.bestAgentIndex,
        from: this.payCoin,
        to: this.coin,
        amount: this.youPay,
        sendTo: this.sendTo
      })
    },
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
