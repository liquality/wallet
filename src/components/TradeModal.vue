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
            <span class="input-group-text">{{asset}}</span>
          </div>
        </div>
      </div>

      <div v-if="bestMarketBasedOnAmount">
        <div class="mb-2">
          <p class="mb-0 d-flex justify-content-between align-items-center cursor-pointer" @click="sendTo = null; enterSendToAddress = !enterSendToAddress">
            <span class="bold-label text-primary">Send {{asset}} to</span>
            <span v-if="!enterSendToAddress">
              <span class="text-muted">self</span>
            </span>
          </p>
          <div v-if="enterSendToAddress">
            <input type="text" class="form-control simple mb-0" v-model="sendTo">
          </div>
        </div>

        <label class="bold-label text-primary">Pay using</label>
        <select class="form-control form-control-lg mb-3" v-model="payAsset">
          <option
            v-for="(data, payUsing) in networkMarketData[asset]"
            :key="payUsing"
            :value="payUsing">{{prettyBalance(networkWalletBalances[payUsing], payUsing)}} {{payUsing}}</option>
        </select>

        <p class="mb-2 d-flex justify-content-between align-items-center">
          <span class="bold-label text-primary">Rate</span>
          <span>
            <small class="text-muted">1 {{asset}} = </small>
            <span class="font-weight-normal">{{dpUI(bestBuyRateBasedOnAmount, payAsset)}} </span>
            <small class="text-muted">{{payAsset}}</small>
          </span>
        </p>

        <p class="mb-3 d-flex justify-content-between align-items-center">
          <span class="bold-label text-primary">You pay</span>
          <span>
            <span class="font-weight-normal">{{youPay}} </span>
            <small class="text-muted">{{payAsset}}</small>
          </span>
        </p>
      </div>
      <div v-else>
        <p class="mb-2 d-flex justify-content-between align-items-center cursor-pointer" @click="setAmount(buyMin)">
          <span class="bold-label text-primary">Min</span>
          <span>
            <span class="font-weight-normal">{{buyMin}} </span>
            <small class="text-muted">{{asset}}</small>
          </span>
        </p>
        <p class="mb-3 d-flex justify-content-between align-items-center cursor-pointer" @click="setAmount(buyMax)">
          <span class="bold-label text-primary">Max</span>
          <span>
            <span class="font-weight-normal">{{buyMax}} </span>
            <small class="text-muted">{{asset}}</small>
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
    </div>
  </Modal>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import BN from 'bignumber.js'
import cryptoassets from '@liquality/cryptoassets'

import { dpUI, prettyBalance } from '@/utils/coinFormatter'

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
      payAsset: null,
      enterSendToAddress: false,
      sendTo: null
    }
  },
  props: {
    asset: String
  },
  created () {
    this.payAsset = Object.keys(this.selectedMarket)[0]
    this.amount = this.buyMin
  },
  computed: {
    ...mapState(['activeNetwork', 'marketData', 'balances']),
    walletId () {
      return this.$route.params.walletId
    },
    walletOrders () {
      return this.orders.filter(order => order.walletId === this.walletId)
    },
    networkMarketData () {
      return this.marketData[this.activeNetwork]
    },
    networkWalletBalances () {
      return this.balances[this.activeNetwork][this.walletId]
    },

    bestAgent () {
      return this.bestMarketBasedOnAmount.agent
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
      return dpUI(BN(this.payMarket.sellMin).times(this.payMarket.sellRate), this.asset)
    },
    buyMax () {
      return dpUI(BN(this.payMarket.sellMax).times(this.payMarket.sellRate), this.asset, true)
    },
    safeAmount () {
      return this.amount || 0
    },
    payMarket () {
      return this.selectedMarket[this.payAsset]
    },
    payBalance () {
      return this.networkWalletBalances[this.payAsset]
    },
    selectedMarket () {
      return this.networkMarketData[this.asset]
    },
    canBuy () {
      const amount = BN(this.safeAmount)
      const youPay = BN(this.youPay)

      if (amount.gt(this.buyMax) || amount.lt(this.buyMin) || youPay.gt(this.payBalance)) return false

      return true
    },
    youPay () {
      return dpUI(BN(this.safeAmount).div(this.bestSellRateBasedOnAmount), this.payAsset)
    }
  },
  methods: {
    ...mapActions(['newSwap']),
    dpUI,
    prettyBalance,
    setAmount (amount) {
      if (this.loading) return

      this.amount = amount
    },
    async buy () {
      this.loading = true

      const fromAmount = cryptoassets[this.payAsset.toLowerCase()].currencyToUnit(this.youPay)

      await this.newSwap({
        network: this.activeNetwork,
        walletId: this.walletId,
        agent: this.bestAgent,
        from: this.payAsset,
        to: this.asset,
        fromAmount,
        sendTo: this.sendTo,
        auto: false
      })

      this.autoAsset = null
      this.buyAsset = null

      this.$emit('close')
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
