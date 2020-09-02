<template>
  <div class="swap wrapper">
    <div class="wrapper_top form">
      <div class="text-center"><small class="text-danger" v-if="ethRequired">An ETH balance is required to swap.</small></div>
      <div class="form-group">
        <label for="amount">Send
          <span class="label-append">${{prettyFiatBalance(amount, fiatRates[asset])}}</span>
        </label>
        <div class="input-group swap_asset">
          <img :src="'./img/' + asset.toLowerCase() +'.png'" class="swap_asset_icon" />
          <div class="input-group-append">
            <span class="input-group-text">{{asset}}</span>
          </div>
          <input type="text" class="form-control" id="amount" v-model="amount" placeholder="0.00" :style="getAssetColorStyle(asset)">
        </div>
        <small class="form-text d-flex justify-content-between">
          <div class="swap_limits">
            <a href="javascript:void(0)" @click="setAmount(min)">Min</a> {{min}} <a href="javascript:void(0)" class="ml-1" @click="setAmount(max)">Max</a> {{max}}
          </div>
          <div class="text-right">
            <span class="text-muted">Balance&nbsp;</span>
            <span>{{balance}} {{asset}}</span>
          </div>
        </small>
      </div>
      <div class="form-group">
        <label for="amount">Receive</label>
        <div class="input-group swap_asset">
          <img :src="'./img/' + toAsset.toLowerCase() +'.png'" class="swap_asset_icon" />
          <div class="input-group-append">
            <span class="input-group-text">
              <select class="custom-select" @change="setToAsset($event.target.value)" v-model="toAsset">
                <option v-for="to in toAssets" :key="to" :value="to">{{to}}</option>
              </select>
            </span>
          </div>
          <input type="text" class="form-control" readonly v-model="toAmount" placeholder="0.00" :style="getAssetColorStyle(toAsset)">
        </div>
        <small class="form-text d-flex justify-content-between" v-if="!enterSendToAddress">
          <div class="swap_limits">
            <a href="javascript:void(0)" @click="enterSendToAddress = true">+ Receive at external address</a>
          </div>
        </small>
      </div>
      <div class="form-group" v-if="enterSendToAddress">
        <label class="w-100" for="amount">Receive at <a href="javascript:void(0)" class="text-muted float-right" @click="enterSendToAddress = false; sendTo = null">X</a></label>
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

      <div class="form-group swap_fees" v-if="availableFees.size">
        <label>Network Speed/Fee</label>
        <div class="swap_fees_asset" v-for="asset in availableFees" :key="asset">
          {{ asset }}
          <FeeSelector :asset="asset" v-model="selectedFee[asset]" v-bind:fees="getAssetFees(asset)" />
        </div>
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
import FeeSelector from '@/components/FeeSelector'
import { dpUI, prettyBalance, prettyFiatBalance } from '@/utils/coinFormatter'
import { getChainFromAsset, getAssetColorStyle } from '@/utils/asset'

export default {
  components: {
    FeeSelector
  },
  data () {
    return {
      amount: 0,
      toAsset: null,
      enterSendToAddress: false,
      sendTo: null,
      selectedFee: {}
    }
  },
  props: {
    asset: String
  },
  created () {
    this.toAsset = Object.keys(this.selectedMarket)[0]
    this.amount = this.min
    this.updateMarketData({ network: this.activeNetwork })
    this.updateFees({ asset: this.assetChain })
    this.updateFees({ asset: this.toAssetChain })
    this.selectedFee = {
      [this.assetChain]: 'average',
      [this.toAssetChain]: 'average'
    }
  },
  computed: {
    ...mapState(['activeNetwork', 'activeWalletId', 'marketData', 'balances', 'fees', 'fiatRates']),
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
      const amount = BN(this.amount)
      return this.market.markets.slice().sort((a, b) => {
        if (amount.gte(BN(a.sellMin)) && amount.lte(BN(a.sellMax))) return -1
        else if (amount.gte(BN(a.sellMin)) && amount.lte(BN(a.sellMax))) return 1
        else return 0
      })[0]
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
    ethRequired () {
      return this.networkWalletBalances.ETH === 0
    },
    canSwap () {
      const amount = BN(this.safeAmount)

      if (this.ethRequired || amount.gt(this.max) || amount.lt(this.min) || amount.gt(this.balance)) return false

      return true
    },
    toAmount () {
      return dpUI(BN(this.safeAmount).times(this.bestRateBasedOnAmount), this.toAsset)
    },
    assetChain () {
      return getChainFromAsset(this.asset)
    },
    toAssetChain () {
      return getChainFromAsset(this.toAsset)
    },
    availableFees () {
      const availableFees = new Set([])
      const fees = this.getAssetFees(this.assetChain)
      const toFees = this.getAssetFees(this.toAssetChain)
      if (fees && Object.keys(fees).length) availableFees.add(this.assetChain)
      if (toFees && Object.keys(toFees).length) availableFees.add(this.toAssetChain)
      return availableFees
    }
  },
  methods: {
    ...mapActions(['updateMarketData', 'updateFees']),
    prettyFiatBalance,
    getAssetColorStyle,
    getAssetFees (asset) {
      return this.fees[this.activeNetwork]?.[this.activeWalletId]?.[asset]
    },
    setAmount (amount) {
      this.amount = amount
    },
    setToAsset (val) {
      this.toAsset = val
      this.updateFees({ asset: this.toAssetChain })
      this.selectedFee = Object.assign({}, this.selectedFee, {
        [this.toAssetChain]: 'average'
      })
    },
    async swap () {
      const fee = this.availableFees.has(this.assetChain)
        ? this.getAssetFees(this.assetChain)[this.selectedFee[this.assetChain]].fee
        : undefined

      const toFee = this.availableFees.has(this.toAssetChain)
        ? this.getAssetFees(this.toAssetChain)[this.selectedFee[this.toAssetChain]].fee
        : undefined

      this.$router.push({
        name: 'SwapConfirm',
        params: {
          agent: this.bestAgent, asset: this.asset, toAsset: this.toAsset, amount: this.amount, toAmount: this.toAmount, rate: this.bestRateBasedOnAmount, sendTo: this.sendTo, fee, toFee
        }
      })
    }
  }
}
</script>

<style lang="scss">
.swap {
  &_asset {
    &.input-group {
      align-items: center;
    }

    &_icon {
      width: 28px;
      height: 28px;
      margin-right: 4px;
    }

    input {
      text-align: right;
      margin-left: 12px;
    }
  }

  &_fees {
    &_asset {
      font-weight: bold;
      margin-bottom: 6px;
    }
  }
}
</style>
