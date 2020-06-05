<template>
  <div class="swap wrapper">
    <div class="wrapper_top form">
      <div class="form-group">
        <label for="amount">Send</label>
        <div class="input-group">
          <input type="number" class="form-control" id="amount" v-model="amount" placeholder="0.00">
          <div class="input-group-append">
            <span class="input-group-text">{{asset}}</span>
          </div>
        </div>
        <small class="form-text d-flex justify-content-between">
          <div class="swap_limits">
            <a href="#" @click="setAmount(min)">Min</a> {{min}} <a href="#" class="ml-1" @click="setAmount(max)">Max</a> {{max}}
          </div>
          <div class="text-right">
            <span class="text-muted">Balance&nbsp;</span>
            <span>{{balance}} {{asset}}</span>
          </div>
        </small>
      </div>
      <div class="form-group">
        <label for="amount">Receive</label>
        <div class="input-group">
          <input type="number" class="form-control" id="amount" readonly v-model="toAmount" placeholder="0.00">
          <div class="input-group-append">
            <span class="input-group-text">
              <select class="custom-select" @change="setToAsset($event.target.value)" v-model="toAsset">
                <option v-for="to in toAssets" :key="to">{{to}}</option>
              </select>
            </span>
          </div>
        </div>
        <small class="form-text d-flex justify-content-between">
          <div class="swap_limits">
            <a href="#" @click="enterSendToAddress = true">+ Receive at external address</a>
          </div>
        </small>

      </div>
      <div class="form-group" v-if="enterSendToAddress">
        <label class="w-100" for="amount">Receive at <a href="#" class="text-muted float-right" @click="enterSendToAddress = false; sendTo = null">X</a></label>
        <div class="input-group">
          <div class="input-group">
            <input type="text" v-model="sendTo" class="form-control form-control-sm" id="to" placeholder="External Receiving Address" autocomplete="off">
          </div>
        </div>
      </div>

      <div class="swap_rate form-group">
        <label>Rate</label>
        <p><span class="swap-rate_base">1 {{asset}} =</span><span class="swap-rate_value">&nbsp;{{bestRateBasedOnAmount}}</span><span class="swap-rate_term">&nbsp;{{toAsset}}</span></p>
      </div>
    </div>
    <div class="wrapper_bottom">
      <div class="button-group">
        <button class="btn btn-light btn-outline-primary btn-lg" @click="$router.go(-1)">Cancel</button>
        <button class="btn btn-primary btn-lg" @click="swap" :disabled="!bestMarketBasedOnAmount || !canSwap">Review Terms</button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import BN from 'bignumber.js'

import { dpUI, prettyBalance } from '@/utils/coinFormatter'

export default {
  data () {
    return {
      amount: 0,
      toAsset: null,
      enterSendToAddress: false,
      sendTo: null
    }
  },
  props: {
    asset: String
  },
  created () {
    this.toAsset = Object.keys(this.selectedMarket)[0]
    this.amount = this.min
    this.updateMarketData({ network: this.activeNetwork })
  },
  computed: {
    ...mapState(['activeNetwork', 'marketData', 'balances', 'activeWalletId']),
    networkMarketData () {
      return this.marketData[this.activeNetwork]
    },
    networkWalletBalances () {
      return this.balances[this.activeNetwork][this.activeWalletId]
    },
    toAssets () {
      return Object.keys(this.selectedMarket)
    },
    bestAgent () {
      return this.bestMarketBasedOnAmount.agent
    },
    bestRateBasedOnAmount () {
      return this.bestMarketBasedOnAmount.sellRate
    },
    bestMarketBasedOnAmount () {
      return this.market.markets.find(market => {
        const amount = BN(this.amount)
        return BN(market.sellMin).lte(amount) && BN(market.sellMax).gte(amount)
      })
    },
    min () {
      return dpUI(BN(this.market.sellMin), this.asset)
    },
    max () {
      return dpUI(BN(this.market.sellMax), this.asset, true)
    },
    safeAmount () {
      return this.amount || 0
    },
    market () {
      return this.selectedMarket[this.toAsset]
    },
    balance () {
      return prettyBalance(this.networkWalletBalances[this.asset], this.asset)
    },
    selectedMarket () {
      return this.networkMarketData[this.asset]
    },
    canSwap () {
      const amount = BN(this.safeAmount)

      if (amount.gt(this.max) || amount.lt(this.min) || amount.gt(this.balance)) return false

      return true
    },
    toAmount () {
      return dpUI(BN(this.safeAmount).times(this.bestRateBasedOnAmount), this.toAsset)
    }
  },
  methods: {
    ...mapActions(['newSwap', 'updateMarketData']),
    setAmount (amount) {
      this.amount = amount
    },
    setToAsset (val) {
      this.toAsset = val
    },
    async swap () {
      this.$router.push({
        name: 'SwapConfirm',
        params: {
          agent: this.bestAgent, asset: this.asset, toAsset: this.toAsset, amount: this.amount, toAmount: this.toAmount, rate: this.bestRateBasedOnAmount, sendTo: this.sendTo
        }
      })
    }
  }
}
</script>

<style lang="scss">
.swap {

}
</style>
